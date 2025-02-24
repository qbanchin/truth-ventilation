
import { TruthCard } from "@/components/TruthCard";
import { TruthForm } from "@/components/TruthForm";
import TruthHeader from "@/components/TruthHeader";
import { useTruths } from "@/hooks/useTruths";
import { factCheckTruth, addCorrectiveComment } from "@/utils/factCheck";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { truths, setTruths } = useTruths();
  const { toast } = useToast();

  const handleNewTruth = async (truthText: string) => {
    const factCheckResult = await factCheckTruth(truthText);
    let shouldProceed = true;
    let correction = null;

    if (factCheckResult && factCheckResult !== 'VERIFIED') {
      try {
        const factCheckData = JSON.parse(factCheckResult);
        correction = factCheckData;
        
        toast({
          title: "Content Review Alert",
          description: factCheckData.explanation,
          variant: "destructive",
          duration: 6000,
        });

        if (factCheckData.correction === "Links are not allowed" || 
            factCheckData.correction === "Inappropriate content detected" ||
            factCheckData.correction === "Content violates guidelines") {
          shouldProceed = false;
          return;
        }
      } catch (e) {
        console.error('Error parsing fact check result:', e);
      }
    }

    if (!shouldProceed) return;

    const { data: userData } = await supabase.auth.getUser();
    const truthData = {
      text: truthText,
      is_anonymous: true,
      fact_check: correction ? JSON.stringify(correction) : null,
      is_spam: false,
      ...(userData.user ? { user_id: userData.user.id } : {}),
    };

    const { data, error } = await supabase
      .from('truths')
      .insert([truthData])
      .select()
      .single();

    if (error) {
      console.error('Error creating truth:', error);
      return;
    }

    if (data) {
      let comments = [];
      if (correction) {
        const comment = await addCorrectiveComment(
          data.id,
          correction.correction,
          correction.explanation
        );
        if (comment) {
          comments = [comment];
        }
      }

      if (!data.is_spam) {
        setTruths(prev => [{
          ...data,
          likes: 0,
          comments,
          factCheck: correction,
        }, ...prev]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <TruthHeader />
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
