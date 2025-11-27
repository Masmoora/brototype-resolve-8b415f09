import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PlusCircle, ClipboardList, Clock, CheckCircle } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pending: 0,
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
      .eq("student_id", user!.id);

    const totalComplaints = count || 0;
    const pending = data?.filter((c) => c.status === "pending").length || 0;
    const inProgress = data?.filter((c) => c.status === "in_progress" || c.status === "assigned").length || 0;
    const resolved = data?.filter((c) => c.status === "resolved").length || 0;

    setStats({
      totalComplaints,
      pending,
      inProgress,
      resolved,
    });
  };

  const statCards = [
    {
      title: "Total Complaints",
      value: stats.totalComplaints,
      description: "All your complaints",
      icon: ClipboardList,
      color: "text-primary",
    },
    {
      title: "Pending",
      value: stats.pending,
      description: "Awaiting assignment",
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      description: "Being handled",
      icon: Clock,
      color: "text-status-inProgress",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      description: "Completed",
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Submit and track your complaints
          </p>
        </div>
        <Button onClick={() => navigate("/student/new-complaint")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Complaint
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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