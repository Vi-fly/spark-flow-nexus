
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Contacts from "./pages/Contacts";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/contacts" element={<Contacts />} />
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
            <Route path="/discussions" element={
              <Placeholder 
                title="Discussions" 
                description="Team collaboration platform for posts, comments, and thread management." 
              />
            } />
            <Route path="/attendance" element={
              <Placeholder 
                title="Attendance Tracking" 
                description="Monitor team presence, time tracking, and attendance management." 
              />
            } />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
