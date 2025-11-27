import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "assigned" | "in_progress" | "resolved";
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  assigned: {
    label: "Assigned",
    className: "bg-status-assigned/10 text-status-assigned border-status-assigned/20",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-status-inProgress/10 text-status-inProgress border-status-inProgress/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-success/10 text-success border-success/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}