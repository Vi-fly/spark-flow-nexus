
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Discussions from "./pages/Discussions";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/discussions" element={<Discussions />} />
                  <Route path="/gantt" element={
                    <Placeholder 
                      title="Gantt Chart" 
                      description="Visualize project timelines, dependencies, and progress in an interactive Gantt chart." 
                    />
                  } />
                  <Route path="/email" element={
                    <Placeholder 
                      title="Email System" 
                      description="Send task-related emails and notifications to team members and contacts." 
                    />
                  } />
                  <Route path="/resources" element={
                    <Placeholder 
                      title="Resource Bot" 
                      description="AI-powered assistant for resource allocation and task suggestions." 
                    />
                  } />
                  <Route path="/data" element={
                    <Placeholder 
                      title="Data View" 
                      description="Comprehensive data visualization and analytics dashboard for all your project metrics." 
                    />
                  } />
                  <Route path="/attendance" element={
                    <Placeholder 
                      title="Attendance Tracking" 
                      description="Monitor team presence, time tracking, and attendance management." 
                    />
                  } />
                </Route>
              </Route>
              <Route path="/index" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
