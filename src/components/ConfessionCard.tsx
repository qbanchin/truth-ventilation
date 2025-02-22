
import { useState } from "react";
import { HeartIcon, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: number;
  text: string;
  timestamp: string;
}

interface ConfessionCardProps {
  id: number;
  text: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
}

export const ConfessionCard = ({ id, text, timestamp, likes: initialLikes, comments: initialComments }: ConfessionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const handleLike = () => {
    setLikes(prev => prev + 1);
    toast({
      title: "Thanks for sharing the love!",
      description: "Your support means a lot to the confessor.",
      duration: 2000,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment,
      timestamp: new Date().toISOString(),
    };

    setComments(prev => [...prev, comment]);
    setNewComment("");
    toast({
      title: "Comment added",
      description: "Your thoughts have been shared.",
      duration: 2000,
    });
  };

  return (
    <div className="confession-card bg-card rounded-lg shadow-sm p-6 mb-6 hover:shadow-md hover-effect">
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">{new Date(timestamp).toLocaleDateString()}</p>
        <p className="text-foreground text-lg leading-relaxed">{text}</p>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={handleLike}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary hover-effect"
        >
          <HeartIcon size={18} />
          <span className="text-sm">{likes}</span>
        </button>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary hover-effect"
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 hover-effect"
            >
              Comment
            </button>
          </form>

          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="bg-muted p-3 rounded-md">
                <p className="text-sm mb-1">{comment.text}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
