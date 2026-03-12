import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
}

export function EmptyState({ emoji, title, description, actionLabel, actionUrl }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl mb-4">{emoji}</span>
      <h3 className="text-lg font-heading font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>
      {actionLabel && actionUrl && (
        <Link to={actionUrl}>
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
