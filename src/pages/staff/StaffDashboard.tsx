import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardList, Clock, CheckCircle } from "lucide-react";

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAssigned: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    const { data, count } = await supabase
      .from("complaints")
      .select("status", { count: "exact" })
      .eq("assigned_staff_id", user!.id);

    const totalAssigned = count || 0;
    const inProgress = data?.filter((c) => c.status === "in_progress" || c.status === "assigned").length || 0;
    const resolved = data?.filter((c) => c.status === "resolved").length || 0;

    setStats({
      totalAssigned,
      inProgress,
      resolved,
    });
  };

  const statCards = [
    {
      title: "Total Assigned",
      value: stats.totalAssigned,
      description: "All assigned to you",
      icon: ClipboardList,
      color: "text-primary",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      description: "Currently handling",
      icon: Clock,
      color: "text-status-inProgress",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      description: "Completed by you",
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and resolve assigned complaints
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}