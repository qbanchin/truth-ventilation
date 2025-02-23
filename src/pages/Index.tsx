
import { useEffect, useState } from "react";
import { TruthCard } from "@/components/ConfessionCard";
import { TruthForm } from "@/components/ConfessionForm";
import { supabase } from "@/lib/supabase";
import type { Truth, Comment } from "@/lib/supabase";

interface TruthWithMeta extends Truth {
  likes: number;
  comments: Comment[];
}

const Index = () => {
  const [truths, setTruths] = useState<TruthWithMeta[]>([]);

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

    const truthsWithMeta = data.map(truth => ({
      ...truth,
      likes: truth.truth_likes?.length || 0,
      comments: truth.comments || [],
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
      }, fetchTruths)
      .subscribe();

    return () => {
      truthsSubscription.unsubscribe();
    };
  };

  const handleNewTruth = async (truthText: string) => {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('truths')
      .insert([
        {
          text: truthText,
          user_id: user.user?.id,
          is_anonymous: true,
        }
      ]);

    if (error) {
      console.error('Error creating truth:', error);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <header className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-foreground mb-4">Say The Truth</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A safe space to share your truths anonymously and connect with others who understand.
          </p>
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
