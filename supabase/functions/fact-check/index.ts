
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to check for links
const containsLinks = (text: string): boolean => {
  const urlRegex = /(http:\/\/|https:\/\/|www\.)[^\s]+/g;
  return urlRegex.test(text);
};

// Function to check for inappropriate content
const containsInappropriateContent = (text: string): boolean => {
  const inappropriateWords = [
    'porn', 'xxx', 'sex', 'nude', 'naked', 'spam'
  ];
  const lowerText = text.toLowerCase();
  return inappropriateWords.some(word => lowerText.includes(word));
};

// Function to perform basic fact checking
const basicFactCheck = (text: string) => {
  const knownFalsehoods = [
    {
      pattern: /earth is flat/i,
      correction: "The Earth is spherical",
      explanation: "Scientific evidence, including satellite imagery and centuries of astronomical observations, confirms that the Earth is roughly spherical."
    },
    {
      pattern: /vaccines cause autism/i,
      correction: "Vaccines do not cause autism",
      explanation: "This claim has been thoroughly debunked by numerous scientific studies. Vaccines are safe and effective at preventing serious diseases."
    },
    {
      pattern: /climate change is fake/i,
      correction: "Climate change is real and supported by scientific evidence",
      explanation: "The vast majority of climate scientists agree that climate change is real and primarily caused by human activities."
    }
  ];

  for (const falsehood of knownFalsehoods) {
    if (falsehood.pattern.test(text)) {
      return {
        correction: falsehood.correction,
        explanation: falsehood.explanation
      };
    }
  }

  return null;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    // Check for links
    if (containsLinks(text)) {
      return new Response(
        JSON.stringify({
          result: JSON.stringify({
            correction: "Links are not allowed",
            explanation: "For security reasons, we don't allow sharing links in truths."
          })
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for inappropriate content
    if (containsInappropriateContent(text)) {
      return new Response(
        JSON.stringify({
          result: JSON.stringify({
            correction: "Inappropriate content detected",
            explanation: "This content violates our community guidelines. Please keep posts appropriate and respectful."
          })
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Perform basic fact checking
    const factCheckResult = basicFactCheck(text);
    if (factCheckResult) {
      return new Response(
        JSON.stringify({
          result: JSON.stringify(factCheckResult)
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no issues found, return VERIFIED
    return new Response(
      JSON.stringify({
        result: "VERIFIED"
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fact-check function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
