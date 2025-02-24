
import { useState } from "react";
import { HeartIcon, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FactCheck } from "./truth/FactCheck";
import { CommentList } from "./truth/CommentList";
import type { TruthCardProps } from "@/types/truth";

export const TruthCard = ({ 
  id, 
  text, 
  created_at, 
  likes: initialLikes, 
  comments: initialComments,
  factCheck 
}: TruthCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [likes, setLikes] = useState(initialLikes);
  const { toast } = useToast();

  const handleLike = async () => {
    const { error } = await supabase
      .from('truth_likes')
      .insert([
        {
          truth_id: id,
          // Set a default anonymous user ID since we don't have auth yet
          user_id: '00000000-0000-0000-0000-000000000000',
        }
      ]);

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Already liked",
          description: "This truth has already been liked.",
          duration: 2000,
        });
        return;
      }
      console.error('Error liking truth:', error);
      return;
    }

    setLikes(prev => prev + 1);
    toast({
      title: "Thanks for sharing the love!",
      description: "Your support means a lot to the truth sharer.",
      duration: 2000,
    });
  };

  return (
    <div className="truth-card bg-card rounded-lg shadow-sm p-6 mb-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">
          {new Date(created_at).toLocaleDateString()}
        </p>
        <p className="text-foreground text-lg leading-relaxed">{text}</p>
        
        {factCheck && <FactCheck {...factCheck} />}
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={handleLike}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <HeartIcon size={18} />
          <span className="text-sm">{likes}</span>
        </button>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-sm">{initialComments.filter(c => !c.is_spam).length}</span>
        </button>
      </div>

      {isExpanded && (
        <CommentList 
          truthId={id}
          initialComments={initialComments}
        />
      )}
    </div>
  );
};
