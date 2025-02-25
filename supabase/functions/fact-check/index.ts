
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced fact-checking patterns
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
  },
  {
    pattern: /covid.*(hoax|fake)/i,
    correction: "COVID-19 is a real and serious disease",
    explanation: "COVID-19 is a well-documented infectious disease that has affected millions worldwide, backed by extensive scientific research and medical evidence."
  }
];

const misinformationPatterns = {
  conspiracy: /illuminati|new world order|chemtrails|mind control|5g causes|controlled by aliens/i,
  medical: /cure.{1,20}(cancer|diabetes|aids)|natural remedy|miracle cure|healing crystal/i,
  historical: /holocaust.*(fake|hoax)|moon landing.*(fake|hoax)|9\/11.*(inside job|conspiracy)/i,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    // First check for known falsehoods
    for (const falsehood of knownFalsehoods) {
      if (falsehood.pattern.test(text)) {
        return new Response(
          JSON.stringify({
            result: JSON.stringify({
              correction: falsehood.correction,
              explanation: falsehood.explanation
            })
          }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for general misinformation patterns
    for (const [category, pattern] of Object.entries(misinformationPatterns)) {
      if (pattern.test(text)) {
        return new Response(
          JSON.stringify({
            result: JSON.stringify({
              correction: "This content contains potential misinformation",
              explanation: `This statement contains claims commonly associated with ${category} misinformation. Please verify with reliable sources.`
            })
          }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
