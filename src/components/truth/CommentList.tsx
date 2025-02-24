
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Comment } from "@/types/truth";

interface CommentListProps {
  truthId: number;
  initialComments: Comment[];
}

export const CommentList = ({ truthId, initialComments }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>(
    initialComments.filter(comment => !comment.is_spam)
  );
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          truth_id: truthId,
          text: newComment,
          // Set a default anonymous user ID since we don't have auth yet
          user_id: '00000000-0000-0000-0000-000000000000',
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Could not add your comment. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
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
  );
};
