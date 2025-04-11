
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
import Gantt from "./pages/Gantt";
import Email from "./pages/Email";
import Resources from "./pages/Resources";
import Attendance from "./pages/Attendance";
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
                  <Route path="/gantt" element={<Gantt />} />
                  <Route path="/email" element={<Email />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/data" element={
                    <Placeholder 
                      title="Data View" 
                      description="Comprehensive data visualization and analytics dashboard for all your project metrics." 
                    />
                  } />
                  <Route path="/attendance" element={<Attendance />} />
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

// Simple placeholder component to avoid importing the full Placeholder component
const Placeholder = ({ title, description }: { title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <h1 className="text-2xl font-bold mb-2">{title}</h1>
    <p className="text-muted-foreground max-w-md mb-6">{description}</p>
    <div className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full font-medium">
      Coming Soon
    </div>
  </div>
);

export default App;
