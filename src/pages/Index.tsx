
import { useEffect, useState } from "react";
import { ConfessionCard } from "@/components/ConfessionCard";
import { ConfessionForm } from "@/components/ConfessionForm";
import { supabase } from "@/lib/supabase";
import type { Confession } from "@/lib/supabase";

interface ConfessionWithMeta extends Confession {
  likes: number;
  comments: Array<{
    id: number;
    text: string;
    created_at: string;
  }>;
}

const Index = () => {
  const [confessions, setConfessions] = useState<ConfessionWithMeta[]>([]);

  useEffect(() => {
    fetchConfessions();
    setupSubscription();
  }, []);

  const fetchConfessions = async () => {
    const { data, error } = await supabase
      .from('confessions')
      .select(`
        *,
        comments (id, text, created_at),
        confession_likes (confession_id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching confessions:', error);
      return;
    }

    const confessionsWithMeta = data.map(confession => ({
      ...confession,
      likes: confession.confession_likes?.length || 0,
      comments: confession.comments || [],
    }));

    setConfessions(confessionsWithMeta);
  };

  const setupSubscription = () => {
    const confessionsSubscription = supabase
      .channel('public:confessions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'confessions' 
      }, fetchConfessions)
      .subscribe();

    return () => {
      confessionsSubscription.unsubscribe();
    };
  };

  const handleNewConfession = async (confessionText: string) => {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('confessions')
      .insert([
        {
          text: confessionText,
          user_id: user.user?.id,
          is_anonymous: true,
        }
      ]);

    if (error) {
      console.error('Error creating confession:', error);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <header className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-foreground mb-4">Say The Truth</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A safe space to share your confessions anonymously and connect with others who understand.
          </p>
        </header>

        <ConfessionForm onConfessionSubmit={handleNewConfession} />

        <div className="space-y-6">
          {confessions.map((confession) => (
            <ConfessionCard
              key={confession.id}
              {...confession}
            />
          ))}

          {confessions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground animate-fadeIn">
              <p>No confessions yet. Be the first to share your truth.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
