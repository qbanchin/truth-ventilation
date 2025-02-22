
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ConfessionFormProps {
  onConfessionSubmit: (confession: string) => void;
}

export const ConfessionForm = ({ onConfessionSubmit }: ConfessionFormProps) => {
  const [confession, setConfession] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confession.trim()) return;

    onConfessionSubmit(confession);
    setConfession("");
    toast({
      title: "Confession shared",
      description: "Thank you for being brave and sharing your truth.",
      duration: 3000,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 animate-fadeIn">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="confession" className="text-sm font-medium text-foreground">
            Share your truth
          </label>
          <textarea
            id="confession"
            value={confession}
            onChange={(e) => setConfession(e.target.value)}
            placeholder="Get it off your chest..."
            className="w-full h-32 px-4 py-3 rounded-lg border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={!confession.trim()}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Share Anonymously
        </button>
      </div>
    </form>
  );
};
