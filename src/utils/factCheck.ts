
import { supabase } from "@/lib/supabase";
import type { Comment } from "@/lib/supabase";

export const factCheckTruth = async (text: string) => {
  try {
    console.log('Sending text for fact check:', text);
    const { data, error } = await supabase.functions.invoke('fact-check', {
      body: { text }
    });

    if (error) {
      console.error('Error calling fact-check function:', error);
      return null;
    }

    console.log('Fact check result:', data.result);
    return data.result;
  } catch (error) {
    console.error('Error fact-checking truth:', error);
    return null;
  }
};

export const addCorrectiveComment = async (truthId: number, correction: string, explanation: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        truth_id: truthId,
        text: `${correction}\n\n${explanation}`,
        is_fact_check: true,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding corrective comment:', error);
    return null;
  }

  return data;
};
