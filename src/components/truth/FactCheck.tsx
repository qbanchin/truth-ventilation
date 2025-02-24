
import { AlertTriangle } from "lucide-react";

interface FactCheckProps {
  explanation?: string;
  correction?: string;
}

export const FactCheck = ({ explanation, correction }: FactCheckProps) => {
  return (
    <div className="mt-4 p-4 bg-destructive/10 rounded-md border border-destructive/20">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-destructive">Fact Check</p>
          <p className="text-sm text-muted-foreground mt-1">{explanation}</p>
          {correction && (
            <p className="text-sm font-medium mt-2">Correction: {correction}</p>
          )}
        </div>
      </div>
    </div>
  );
};
