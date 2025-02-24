
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced spam detection patterns
const spamPatterns = {
  repeatedCharacters: /(.)\1{4,}/,  // Detects characters repeated more than 4 times
  excessiveCaps: /[A-Z]{4,}/,  // Detects 4 or more consecutive capital letters
  urls: /(http:\/\/|https:\/\/|www\.)[^\s]+/g,
  suspiciousPatterns: [
    /\$\$\$/, // Money symbols
    /\d{4,}/, // Long number sequences
    /[!?]{3,}/, // Excessive punctuation
    /buy|sell|discount|offer|cheap|free|guarantee|limited time|act now|click here|buy now|order now|bonus|100% free|satisfaction guaranteed/i,
    /\b(crypto|bitcoin|btc|eth|nft)\b/i,
    /\b(casino|poker|betting|gambling)\b/i,
    /\b(v[1|i]agra|c[1|i]al[1|i]s)\b/i,
    /\b(weight loss|diet|slim|lean)\b/i
  ]
};

function isSpam(text: string): { isSpam: boolean; reason?: string } {
  // Check for repeated characters (potential keyboard spam)
  if (spamPatterns.repeatedCharacters.test(text)) {
    return { isSpam: true, reason: "Excessive repeated characters detected" };
  }

  // Check for excessive caps (shouting)
  if (spamPatterns.excessiveCaps.test(text)) {
    return { isSpam: true, reason: "Excessive capital letters detected" };
  }

  // Check for URLs
  if (spamPatterns.urls.test(text)) {
    return { isSpam: true, reason: "URLs are not allowed" };
  }

  // Check for suspicious patterns
  for (const pattern of spamPatterns.suspiciousPatterns) {
    if (pattern.test(text)) {
      return { isSpam: true, reason: "Suspicious content detected" };
    }
  }

  // Rate of special characters
  const specialCharRatio = (text.match(/[^a-zA-Z0-9\s]/g) || []).length / text.length;
  if (specialCharRatio > 0.3) {  // More than 30% special characters
    return { isSpam: true, reason: "Too many special characters" };
  }

  return { isSpam: false };
}

// Function to check for inappropriate content
const containsInappropriateContent = (text: string): boolean => {
  const inappropriateWords = [
    'porn', 'xxx', 'sex', 'nude', 'naked', 'spam', 'scam',
    'phishing', 'hack', 'crack', 'warez', 'torrent'
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

    // Check for spam first
    const spamCheck = isSpam(text);
    if (spamCheck.isSpam) {
      return new Response(
        JSON.stringify({
          result: JSON.stringify({
            correction: "Content blocked",
            explanation: `This content has been identified as potential spam: ${spamCheck.reason}`
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
            correction: "Content violates guidelines",
            explanation: "This content contains inappropriate material. Please keep posts appropriate and respectful."
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
