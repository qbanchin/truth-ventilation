
import { useEffect, useState } from "react";
import { TruthCard } from "@/components/TruthCard";
import { TruthForm } from "@/components/TruthForm";
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Share The Truth</h1>
          <div className="space-y-6">
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A safe and anonymous space where you can share your deepest confessions, hidden secrets, and unfiltered thoughts.
            </p>
            <div className="prose prose-sm max-w-2xl mx-auto text-muted-foreground">
              <p>
                Whether it's about relationships, personal struggles, societal pressures, or even those quirky habits you've never told anyone about, this is your platform to speak your truth without judgment. Explore heartfelt stories, bold opinions, and raw honesty from people around the world, or take the leap and share your own.
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
