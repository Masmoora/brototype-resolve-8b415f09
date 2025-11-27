import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "" as "student" | "staff" | "",
    // Student fields
    batchType: "" as "remote" | "offline" | "",
    batchNumber: "",
    course: "",
    // Staff field
    category: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      if (!formData.role) {
        toast.error("Please select a role");
        setLoading(false);
        return;
      }

      if (formData.phone.length !== 10) {
        toast.error("Phone number must be 10 digits");
        setLoading(false);
        return;
      }

      // Role-specific validation
      if (formData.role === "student") {
        if (!formData.batchType || !formData.batchNumber || !formData.course) {
          toast.error("Please fill all student details");
          setLoading(false);
          return;
        }
      }

      if (formData.role === "staff") {
        if (!formData.category) {
          toast.error("Please select staff category");
          setLoading(false);
          return;
        }
      }

      const redirectUrl = `${window.location.origin}/`;

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: formData.name,
            phone: formData.phone,
            role: formData.role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Insert role-specific details
        if (formData.role === "student") {
          const studentData = {
            user_id: data.user.id,
            batch_type: formData.batchType as "remote" | "offline",
            batch_number: formData.batchNumber,
            course: formData.course,
          };
          
          const { error: studentError } = await supabase
            .from("student_details")
            .insert([studentData]);

          if (studentError) throw studentError;
        } else if (formData.role === "staff") {
          const staffData = {
            user_id: data.user.id,
            category: formData.category,
          };
          
          const { error: staffError } = await supabase
            .from("staff_details")
            .insert([staffData]);

          if (staffError) throw staffError;
        }

        toast.success("Registration submitted. Waiting for admin approval.");
        navigate("/auth/pending");
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="1234567890"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as "student" | "staff" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role === "student" && (
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Student Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="batchType">Batch Type</Label>
                    <Select
                      value={formData.batchType}
                      onValueChange={(value) => setFormData({ ...formData, batchType: value as "remote" | "offline" })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      placeholder="R10, O3, etc."
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course Name</Label>
                  <Input
                    id="course"
                    placeholder="MERN, Python, Java, UI/UX"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {formData.role === "staff" && (
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Staff Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="category">Department/Category</Label>
                  <Input
                    id="category"
                    placeholder="Technical, Management, HR, Support, Mentor"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Button variant="link" className="p-0" onClick={() => navigate("/auth/login")}>
              Sign in
            </Button>
          </div>
          <div className="mt-2 text-center">
            <Button variant="link" className="p-0" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}