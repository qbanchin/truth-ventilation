
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to check for links
const containsLinks = (text: string): boolean => {
  const urlRegex = /(http:\/\/|https:\/\/|www\.)[^\s]+/g;
  return urlRegex.test(text);
};

// Function to check for inappropriate content (basic check)
const containsInappropriateContent = (text: string): boolean => {
  const inappropriateWords = [
    'porn', 'xxx', 'sex', 'nude', 'naked', 'spam', 
    // Add more inappropriate words as needed
  ];
  const lowerText = text.toLowerCase();
  return inappropriateWords.some(word => lowerText.includes(word));
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    // Check for links
    if (containsLinks(text)) {
      return new Response(JSON.stringify({
        result: JSON.stringify({
          correction: "Links are not allowed",
          explanation: "For security reasons, we don't allow sharing links in truths."
        })
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for inappropriate content
    if (containsInappropriateContent(text)) {
      return new Response(JSON.stringify({
        result: JSON.stringify({
          correction: "Inappropriate content detected",
          explanation: "This content violates our community guidelines. Please keep posts appropriate and respectful."
        })
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fact check with GPT-4
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a strict fact-checker and content moderator. Your tasks are:
1. Analyze the statement for factual accuracy
2. If false information is detected, provide a clear correction and explanation
3. If it's a personal experience or opinion, verify it doesn't contain harmful misinformation
4. If the content is inappropriate or harmful, flag it

Respond with one of:
1. "VERIFIED" for true statements or harmless personal experiences
2. A JSON object with "correction" and "explanation" for false or misleading information
3. A JSON object with "correction": "Content violates guidelines" for inappropriate content`
          },
          { role: 'user', content: text }
        ],
      }),
    });

    const data = await response.json();
    const result = data.choices[0].message.content;
    
    // If the content is flagged as false, automatically create a corrective comment
    if (result !== 'VERIFIED') {
      try {
        const factCheckData = JSON.parse(result);
        if (factCheckData.correction && factCheckData.explanation) {
          // Note: We'll handle the comment creation in the frontend to ensure proper error handling
          // and user experience
          console.log('Creating corrective comment for false information:', factCheckData);
        }
      } catch (e) {
        console.error('Error parsing fact check result:', e);
      }
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fact-check function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
