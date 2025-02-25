
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive fact-checking patterns
const knownFalsehoods = [
  // Basic Science Facts
  {
    pattern: /earth is flat/i,
    correction: "The Earth is spherical",
    explanation: "Scientific evidence, including satellite imagery and centuries of astronomical observations, confirms that the Earth is roughly spherical."
  },
  {
    pattern: /the sun revolves around (?:the )?earth/i,
    correction: "The Earth revolves around the Sun",
    explanation: "The Earth, along with other planets in our solar system, orbits around the Sun. This heliocentric model has been proven through astronomical observations and physics."
  },
  // Water Facts
  {
    pattern: /water\s+(?:will\s+)?freezes?\s+at\s+(?!32\s*°?F|0\s*°?C)[-]?\d+\s*°?[FC]?/i,
    correction: "Water freezes at 32°F (0°C)",
    explanation: "Water freezes at 32 degrees Fahrenheit (0 degrees Celsius) under normal atmospheric pressure."
  },
  {
    pattern: /water\s+(?:will\s+)?boils?\s+at\s+(?!212\s*°?F|100\s*°?C)[-]?\d+\s*°?[FC]?/i,
    correction: "Water boils at 212°F (100°C)",
    explanation: "Water boils at 212 degrees Fahrenheit (100 degrees Celsius) under normal atmospheric pressure at sea level."
  },
  // Medical Facts
  {
    pattern: /vaccines cause autism/i,
    correction: "Vaccines do not cause autism",
    explanation: "This claim has been thoroughly debunked by numerous scientific studies. Vaccines are safe and effective at preventing serious diseases."
  },
  {
    pattern: /covid.*(hoax|fake)/i,
    correction: "COVID-19 is a real and serious disease",
    explanation: "COVID-19 is a well-documented infectious disease that has affected millions worldwide, backed by extensive scientific research and medical evidence."
  },
  // Environmental Facts
  {
    pattern: /climate change is (fake|not real|a hoax)/i,
    correction: "Climate change is real and supported by scientific evidence",
    explanation: "The vast majority of climate scientists agree that climate change is real and primarily caused by human activities."
  },
  {
    pattern: /humans don'?t affect climate/i,
    correction: "Human activities do affect climate",
    explanation: "Scientific evidence shows that human activities, particularly the emission of greenhouse gases, have a significant impact on Earth's climate."
  },
  // Space Facts
  {
    pattern: /moon landing was fake/i,
    correction: "The Moon landings were real",
    explanation: "Multiple independent sources have verified the Moon landings, including physical evidence, photographs, and independent tracking by other countries."
  },
  {
    pattern: /mars is flat/i,
    correction: "Mars is spherical",
    explanation: "Like Earth and other planets, Mars is roughly spherical due to gravity's effects on large celestial bodies."
  },
  // Biology Facts
  {
    pattern: /evolution is (fake|not real|a theory)/i,
    correction: "Evolution is a well-established scientific fact",
    explanation: "Evolution through natural selection is supported by extensive evidence from fossils, genetics, and direct observation of species changes."
  },
  // Physics Facts
  {
    pattern: /gravity (isn'?t|is not) real/i,
    correction: "Gravity is a fundamental force of nature",
    explanation: "Gravity is a well-documented force that has been mathematically described and experimentally verified countless times."
  },
  // Historical Facts
  {
    pattern: /holocaust (didn'?t|did not) happen/i,
    correction: "The Holocaust did happen",
    explanation: "The Holocaust is one of the most well-documented genocides in history, with extensive evidence including documents, photographs, and survivor testimonies."
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    console.log('Checking text:', text);
    
    // Check for known falsehoods
    for (const falsehood of knownFalsehoods) {
      console.log('Testing pattern:', falsehood.pattern);
      if (falsehood.pattern.test(text)) {
        console.log('Found falsehood match:', falsehood.correction);
        const result = {
          correction: falsehood.correction,
          explanation: falsehood.explanation
        };
        console.log('Sending correction:', result);
        return new Response(
          JSON.stringify({ result: JSON.stringify(result) }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If no issues found, return VERIFIED
    console.log('No issues found, marking as VERIFIED');
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
