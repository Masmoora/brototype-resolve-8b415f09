import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high";
  className?: string;
}

const priorityConfig = {
  low: {
    label: "Low",
    className: "bg-priority-low/10 text-priority-low border-priority-low/20",
  },
  medium: {
    label: "Medium",
    className: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
  },
  high: {
    label: "High",
    className: "bg-priority-high/10 text-priority-high border-priority-high/20",
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}