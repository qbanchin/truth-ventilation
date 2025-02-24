
import { useEffect, useState } from "react";
import { TruthCard } from "@/components/TruthCard";
import { TruthForm } from "@/components/TruthForm";
import { supabase } from "@/lib/supabase";
import type { Truth, Comment } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface TruthWithMeta extends Truth {
  likes: number;
  comments: Comment[];
  factCheck?: {
    correction?: string;
    explanation?: string;
  };
}

const Index = () => {
  const [truths, setTruths] = useState<TruthWithMeta[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTruths();
    setupSubscription();
  }, []);

  const fetchTruths = async () => {
    const { data, error } = await supabase
      .from('truths')
      .select(`
        *,
        comments (*),
        truth_likes (truth_id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching truths:', error);
      return;
    }

    if (!data) return;

    const truthsWithMeta = data.map(truth => ({
      ...truth,
      likes: truth.truth_likes?.length || 0,
      comments: truth.comments || [],
      factCheck: truth.fact_check ? JSON.parse(truth.fact_check as string) : undefined,
    }));

    setTruths(truthsWithMeta);
  };

  const setupSubscription = () => {
    const truthsSubscription = supabase
      .channel('public:truths')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'truths' 
      }, payload => {
        console.log('Received real-time update:', payload);
        fetchTruths();
      })
      .subscribe();

    return () => {
      truthsSubscription.unsubscribe();
    };
  };

  const factCheckTruth = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fact-check', {
        body: { text }
      });

      if (error) {
        console.error('Error calling fact-check function:', error);
        return null;
      }

      return data.result;
    } catch (error) {
      console.error('Error fact-checking truth:', error);
      return null;
    }
  };

  const handleNewTruth = async (truthText: string) => {
    // First, fact-check the truth
    const factCheckResult = await factCheckTruth(truthText);
    let shouldProceed = true;
    let correction = null;

    if (factCheckResult && factCheckResult !== 'VERIFIED') {
      try {
        const factCheckData = JSON.parse(factCheckResult);
        correction = factCheckData;
        
        // Show a warning toast with the correction
        toast({
          title: "Fact Check Alert",
          description: factCheckData.explanation,
          variant: "destructive",
          duration: 6000,
        });
      } catch (e) {
        console.error('Error parsing fact check result:', e);
      }
    }

    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      const { data, error } = await supabase
        .from('truths')
        .insert([
          {
            text: truthText,
            is_anonymous: true,
            fact_check: correction ? JSON.stringify(correction) : null,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating truth:', error);
        return;
      }

      if (data) {
        setTruths(prev => [{
          ...data,
          likes: 0,
          comments: [],
          factCheck: correction,
        }, ...prev]);
      }
    } else {
      const { data, error } = await supabase
        .from('truths')
        .insert([
          {
            text: truthText,
            user_id: userData.user.id,
            is_anonymous: true,
            fact_check: correction ? JSON.stringify(correction) : null,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating truth:', error);
        return;
      }

      if (data) {
        setTruths(prev => [{
          ...data,
          likes: 0,
          comments: [],
          factCheck: correction,
        }, ...prev]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <header className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-foreground mb-4">Say The Truth</h1>
          <div className="space-y-6">
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A safe and anonymous space where you can share your deepest confessions, hidden secrets, and unfiltered thoughts.
            </p>
            <div className="prose prose-sm max-w-2xl mx-auto text-muted-foreground">
              <p>
                Whether it's about relationships, personal struggles, societal pressures, or even those quirky habits you've never told anyone about, this is your platform to speak your truth without judgment. AI-powered fact-checking helps ensure shared information is accurate and reliable.
              </p>
              <p>
                Here, every voice matters, and every truth has a place. Join us and be part of a community that values authenticity, connection, and the courage to be real.
              </p>
            </div>
          </div>
        </header>

        <TruthForm onTruthSubmit={handleNewTruth} />

        <div className="space-y-6">
          {truths.map((truth) => (
            <TruthCard
              key={truth.id}
              {...truth}
            />
          ))}

          {truths.length === 0 && (
            <div className="text-center py-12 text-muted-foreground animate-fadeIn">
              <p>No truths yet. Be the first to share your truth.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
