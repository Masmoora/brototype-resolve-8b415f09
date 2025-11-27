import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, MessageSquare, UserCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && profile && profile.status === "approved") {
      switch (profile.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "staff":
          navigate("/staff/dashboard");
          break;
        case "student":
          navigate("/student/dashboard");
          break;
      }
    }
  }, [profile, loading, navigate]);

  const features = [
    {
      icon: MessageSquare,
      title: "Submit Complaints",
      description: "Easy-to-use platform for students to raise concerns and track progress",
    },
    {
      icon: UserCheck,
      title: "Staff Assignment",
      description: "Intelligent complaint routing to appropriate staff members",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get instant notifications on complaint status and resolution",
    },
    {
      icon: CheckCircle,
      title: "Resolution Tracking",
      description: "Complete transparency from submission to resolution",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold text-foreground">BroDesk</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth/login")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth/signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground">
            Student Complaint Management
            <span className="block text-primary">Made Simple</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Streamline complaint handling for Brototype students. Submit, track, and resolve
            issues efficiently with our modern platform.
          </p>
          <Button size="lg" onClick={() => navigate("/auth/signup")} className="text-lg">
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Key Features
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 transition-shadow hover:shadow-lg">
              <feature.icon className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Join BroDesk today and experience hassle-free complaint management
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth/signup")}
            className="text-lg"
          >
            Sign Up Now
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 BroDesk. Built for Brototype Students.
        </div>
      </footer>
    </div>
  );
}