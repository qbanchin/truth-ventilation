import { TruthCard } from "@/components/TruthCard";
import { TruthForm } from "@/components/TruthForm";
import TruthHeader from "@/components/TruthHeader";
import { useTruths } from "@/hooks/useTruths";
import { factCheckTruth, addCorrectiveComment } from "@/utils/factCheck";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Index = () => {
  const { truths, setTruths, currentPage, totalPages, fetchTruths } = useTruths();
  const { toast } = useToast();

  const handlePageChange = (page: number) => {
    fetchTruths(page);
  };

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

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => handlePageChange(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
