import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StaffSidebar } from "@/components/staff/StaffSidebar";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Pending from "./pages/auth/Pending";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingUsers from "./pages/admin/PendingUsers";
import StudentDashboard from "./pages/student/StudentDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/pending" element={<Pending />} />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AdminSidebar />
                    <main className="flex-1 p-8">
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users/pending" element={<PendingUsers />} />
                        <Route path="*" element={<AdminDashboard />} />
                      </Routes>
                    </main>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <StudentSidebar />
                    <main className="flex-1 p-8">
                      <Routes>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="*" element={<StudentDashboard />} />
                      </Routes>
                    </main>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />

            {/* Staff Routes */}
            <Route path="/staff/*" element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <StaffSidebar />
                    <main className="flex-1 p-8">
                      <Routes>
                        <Route path="dashboard" element={<StaffDashboard />} />
                        <Route path="*" element={<StaffDashboard />} />
                      </Routes>
                    </main>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;