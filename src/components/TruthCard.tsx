
import { useState } from "react";
import { HeartIcon, MessageCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Comment {
  id: number;
  text: string;
  created_at: string;
  truth_id: number;
  user_id: string;
  is_spam: boolean;
  is_fact_check?: boolean;
}

interface TruthCardProps {
  id: number;
  text: string;
  created_at: string;
  likes: number;
  comments: Comment[];
  factCheck?: {
    correction?: string;
    explanation?: string;
  };
}

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
  const [comments, setComments] = useState<Comment[]>(
    initialComments.filter(comment => !comment.is_spam)
  );
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const handleLike = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like truths.",
        duration: 3000,
      });
      return;
    }

    const { error } = await supabase
      .from('truth_likes')
      .insert([
        {
          truth_id: id,
          user_id: user.user.id,
        }
      ]);

    if (error) {
      if (error.code === '23505') { // Unique violation error code
        toast({
          title: "Already liked",
          description: "You've already liked this truth.",
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment.",
        duration: 3000,
      });
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          truth_id: id,
          text: newComment,
          user_id: user.user.id,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return;
    }

    if (data && !data.is_spam) {
      setComments(prev => [...prev, data]);
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your thoughts have been shared.",
        duration: 2000,
      });
    } else if (data?.is_spam) {
      setNewComment("");
      toast({
        title: "Comment not allowed",
        description: "Your comment was flagged as inappropriate. Please try again with different wording.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  return (
    <div className="truth-card bg-card rounded-lg shadow-sm p-6 mb-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">
          {new Date(created_at).toLocaleDateString()}
        </p>
        <p className="text-foreground text-lg leading-relaxed">{text}</p>
        
        {factCheck && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-md border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Fact Check</p>
                <p className="text-sm text-muted-foreground mt-1">{factCheck.explanation}</p>
                {factCheck.correction && (
                  <p className="text-sm font-medium mt-2">Correction: {factCheck.correction}</p>
                )}
              </div>
            </div>
          </div>
        )}
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
          <span className="text-sm">{comments.length}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Comment
            </button>
          </form>

          <div className="space-y-3">
            {comments.map(comment => (
              <div 
                key={comment.id} 
                className={`p-3 rounded-md ${comment.is_fact_check ? 'bg-destructive/10 border border-destructive/20' : 'bg-muted'}`}
              >
                <p className="text-sm mb-1">
                  {comment.is_fact_check && (
                    <span className="font-medium text-destructive">Fact Check: </span>
                  )}
                  {comment.text}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
