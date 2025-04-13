
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, Download, Filter, Plus, Search } from 'lucide-react';
import { Task } from '@/types/database.types';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GanttTaskProps {
  task: Task;
  startDate: Date;
  daysToShow: number;
  columnWidth: number;
  onTaskClick: (task: Task) => void;
}

// Component for a single task bar in the Gantt chart
const GanttTaskBar: React.FC<GanttTaskProps> = ({ task, startDate, daysToShow, columnWidth, onTaskClick }) => {
  const taskStartDate = task.deadline ? new Date(task.deadline) : new Date();
  taskStartDate.setDate(taskStartDate.getDate() - 3); // For demo purposes, start 3 days before deadline
  
  const taskEndDate = new Date(task.deadline || new Date());
  
  // Calculate position and width
  const diffTime = Math.abs(taskStartDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const taskDuration = Math.abs(taskEndDate.getTime() - taskStartDate.getTime());
  const taskDurationDays = Math.max(1, Math.ceil(taskDuration / (1000 * 60 * 60 * 24)));
  
  const left = diffDays * columnWidth;
  const width = Math.min(taskDurationDays * columnWidth, daysToShow * columnWidth - left);
  
  // Only show tasks that fall within the visible range
  if (diffDays > daysToShow || diffDays + taskDurationDays < 0) {
    return null;
  }
  
  // Color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };
  
  // Color based on status
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'not started': return 'border-slate-400';
      case 'in progress': return 'border-blue-400';
      case 'on hold': return 'border-amber-400';
      case 'completed': return 'border-green-400';
      case 'reviewed & approved': return 'border-purple-400';
      default: return 'border-slate-400';
    }
  };
  
  return (
    <div 
      className={`absolute rounded-md px-2 py-1 text-white text-sm font-medium ${getPriorityColor(task.priority)} ${getStatusColor(task.status)} border-l-4 shadow-sm cursor-pointer hover:opacity-90 transition-opacity`}
      style={{ 
        left: `${left}px`, 
        width: `${width}px`,
        minWidth: '80px'
      }}
      onClick={() => onTaskClick(task)}
    >
      <div className="truncate">{task.title}</div>
    </div>
  );
};

// Main Gantt chart component
export const GanttChart: React.FC = () => {
  const { toast: uiToast } = useToast();
  const [startDate, setStartDate] = useState(new Date());
  const [daysToShow, setDaysToShow] = useState(14);
  const [columnWidth, setColumnWidth] = useState(80);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Generate dates for the header
  const dates = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };
  
  // Load tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('tasks')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        // Transform the data if needed
        const formattedTasks = data.map(task => ({
          ...task,
          // Ensure task has all required fields
          id: task.id,
          title: task.title,
          description: task.description || null,
          status: task.status || 'Not Started',
          priority: task.priority || 'Medium',
          deadline: task.deadline,
          estimated_time: task.estimated_time || null,
          assigned_to: task.assigned_to || null,
          contact_id: task.contact_id || null,
          created_at: task.created_at,
          updated_at: task.updated_at || task.created_at,
          user_id: task.user_id
        }));
        
        setTasks(formattedTasks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        uiToast({
          title: "Error loading tasks",
          description: "Could not load tasks for the Gantt chart",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [uiToast]);
  
  // Filter tasks based on current filter and search query
  const filteredTasks = tasks.filter(task => {
    // Filter by status
    if (filter !== 'all') {
      const statusMatch = task.status.toLowerCase().includes(filter.toLowerCase());
      if (!statusMatch) return false;
    }
    
    // Filter by search query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Handle date navigation
  const navigateToPreviousPeriod = () => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() - daysToShow);
    setStartDate(newStartDate);
  };
  
  const navigateToNextPeriod = () => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() + daysToShow);
    setStartDate(newStartDate);
  };
  
  const navigateToToday = () => {
    setStartDate(new Date());
  };
  
  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    uiToast({
      title: "Task selected",
      description: task.title,
    });
  };
  
  // Handle view change
  const handleViewChange = (value: string) => {
    switch (value) {
      case 'day':
        setDaysToShow(7);
        setColumnWidth(120);
        break;
      case 'week':
        setDaysToShow(14);
        setColumnWidth(80);
        break;
      case 'month':
        setDaysToShow(30);
        setColumnWidth(60);
        break;
      default:
        setDaysToShow(14);
        setColumnWidth(80);
    }
  };
  
  // Handle adding a new task
  const handleAddTask = () => {
    // Navigate to the tasks page with a flag to open the new task form
    window.location.href = '/tasks?new=true';
  };
  
  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Gantt Chart</CardTitle>
            <CardDescription>Visualize your project timeline and task dependencies</CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tabs defaultValue="week" onValueChange={handleViewChange}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" size="icon" onClick={navigateToPreviousPeriod}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={navigateToToday}>
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={navigateToNextPeriod}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center mt-4 space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="not started">Not Started</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="on hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="reviewed & approved">Reviewed & Approved</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          
          <Button onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            {/* Gantt header */}
            <div className="flex min-w-max">
              <div className="w-64 shrink-0 border-r border-border py-2 px-4 font-medium">
                Task
              </div>
              <div className="flex">
                {dates.map((date, index) => (
                  <div 
                    key={index} 
                    className={`text-center py-2 font-medium border-r border-border ${isWeekend(date) ? 'bg-muted' : ''}`}
                    style={{ width: `${columnWidth}px` }}
                  >
                    <div>{date.getDate()}</div>
                    <div className="text-xs text-muted-foreground">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Gantt body */}
            <div className="flex min-w-max">
              {/* Task names */}
              <div className="w-64 shrink-0 border-r border-border">
                {filteredTasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className={`py-4 px-4 border-b border-border ${selectedTask?.id === task.id ? 'bg-primary/10' : ''}`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="text-xs text-muted-foreground">{task.assigned_to || 'Unassigned'}</div>
                  </div>
                ))}
              </div>
              
              {/* Timeline grid */}
              <div className="relative">
                <div className="flex">
                  {dates.map((date, index) => (
                    <div 
                      key={index} 
                      className={`border-r border-border ${isWeekend(date) ? 'bg-muted/50' : ''}`}
                      style={{ width: `${columnWidth}px`, height: `${filteredTasks.length * 57}px` }}
                    ></div>
                  ))}
                </div>
                
                {/* Task bars */}
                {filteredTasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className="absolute"
                    style={{ top: `${index * 57 + 20}px` }}
                  >
                    <GanttTaskBar 
                      task={task} 
                      startDate={startDate} 
                      daysToShow={daysToShow} 
                      columnWidth={columnWidth} 
                      onTaskClick={handleTaskClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {filteredTasks.length === 0 && !loading && (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold">No tasks found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or adding new tasks</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
