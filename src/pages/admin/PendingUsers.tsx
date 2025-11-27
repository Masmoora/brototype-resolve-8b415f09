import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "student";
  created_at: string;
  student_details?: {
    batch_type: string;
    batch_number: string;
    course: string;
  };
  staff_details?: {
    category: string;
  };
}

export default function PendingUsers() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        student_details (*),
        staff_details (*)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load pending users");
      return;
    }

    setUsers(data as PendingUser[]);
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to approve user");
    } else {
      toast.success("User approved successfully");
      loadPendingUsers();
    }
    setActionLoading(null);
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ status: "rejected" })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to reject user");
    } else {
      toast.success("User rejected");
      loadPendingUsers();
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pending Users</h1>
        <p className="text-muted-foreground">
          Approve or reject user registrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Awaiting Approval ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending users
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "student" && user.student_details && (
                        <div className="text-sm">
                          <div>{user.student_details.course}</div>
                          <div className="text-muted-foreground">
                            {user.student_details.batch_type} - {user.student_details.batch_number}
                          </div>
                        </div>
                      )}
                      {user.role === "staff" && user.staff_details && (
                        <div className="text-sm">
                          {user.staff_details.category}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(user.id)}
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(user.id)}
                          disabled={actionLoading === user.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}