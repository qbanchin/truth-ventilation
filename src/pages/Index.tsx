
import { useState } from "react";
import { ConfessionCard } from "@/components/ConfessionCard";
import { ConfessionForm } from "@/components/ConfessionForm";

interface Confession {
  id: number;
  text: string;
  timestamp: string;
  likes: number;
  comments: Array<{
    id: number;
    text: string;
    timestamp: string;
  }>;
}

const Index = () => {
  const [confessions, setConfessions] = useState<Confession[]>([]);

  const handleNewConfession = (confessionText: string) => {
    const newConfession: Confession = {
      id: Date.now(),
      text: confessionText,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
    };
    setConfessions(prev => [newConfession, ...prev]);
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
