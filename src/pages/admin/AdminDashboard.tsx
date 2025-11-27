import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, ClipboardList, Clock, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [usersRes, complaintsRes] = await Promise.all([
      supabase.from("profiles").select("status", { count: "exact" }),
      supabase.from("complaints").select("status", { count: "exact" }),
    ]);

    const totalUsers = usersRes.count || 0;
    const pendingUsers =
      usersRes.data?.filter((u) => u.status === "pending").length || 0;
    const totalComplaints = complaintsRes.count || 0;
    const pendingComplaints =
      complaintsRes.data?.filter((c) => c.status === "pending").length || 0;
    const inProgressComplaints =
      complaintsRes.data?.filter((c) => c.status === "in_progress").length || 0;
    const resolvedComplaints =
      complaintsRes.data?.filter((c) => c.status === "resolved").length || 0;

    setStats({
      totalUsers,
      pendingUsers,
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
    });
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.pendingUsers} pending approval`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Total Complaints",
      value: stats.totalComplaints,
      description: "All complaints",
      icon: ClipboardList,
      color: "text-primary",
    },
    {
      title: "Pending",
      value: stats.pendingComplaints,
      description: "Awaiting assignment",
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "In Progress",
      value: stats.inProgressComplaints,
      description: "Being handled",
      icon: Clock,
      color: "text-status-inProgress",
    },
    {
      title: "Resolved",
      value: stats.resolvedComplaints,
      description: "Completed",
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, complaints, and system overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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