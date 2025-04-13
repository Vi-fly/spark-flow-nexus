
// This file is getting updated to use Supabase for task data
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from '@/services/taskService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChevronRight, ChevronDown, Calendar, Plus, Search, Filter, ArrowUpDown } from 'lucide-react';

// Create interface for GanttTask that includes additional properties needed for the Gantt chart
interface GanttTask extends Task {
  expanded?: boolean;
  progress?: number;
  children?: GanttTask[];
  level?: number;
  duration?: number;
  startDate?: Date;
  endDate?: Date;
}

export const GanttChart = () => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortField, setSortField] = useState<'title' | 'deadline' | 'priority'>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [timeframe, setTimeframe] = useState('week');
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate days for the header based on timeframe
  const days = useMemo(() => {
    const result = [];
    const startDate = new Date(selectedDate);
    const daysToShow = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      result.push(date);
    }
    
    return result;
  }, [selectedDate, timeframe]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortField, sortDirection, showCompleted]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform tasks for Gantt view
      const ganttTasks = data.map(transformTaskForGantt);
      setTasks(ganttTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks for Gantt chart');
    } finally {
      setLoading(false);
    }
  };

  // Transform database task into Gantt task with calculated properties
  const transformTaskForGantt = (task: any): GanttTask => {
    const deadlineDate = task.deadline ? new Date(task.deadline) : new Date();
    const createdAtDate = task.created_at ? new Date(task.created_at) : new Date();
    
    // Calculate duration in days
    const diffTime = Math.abs(deadlineDate.getTime() - createdAtDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate progress based on status
    let progress = 0;
    if (task.status === 'todo') progress = 0;
    else if (task.status === 'in-progress') progress = 50;
    else if (task.status === 'done') progress = 100;
    
    return {
      ...task,
      status: mapStatusValue(task.status),
      priority: mapPriorityValue(task.priority),
      expanded: true,
      progress,
      level: 0,
      duration: diffDays || 1, // Minimum 1 day
      startDate: createdAtDate,
      endDate: deadlineDate
    };
  };

  // Helper function to map database status values to our internal enum
  const mapStatusValue = (status: string): 'todo' | 'in-progress' | 'done' => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'not started' || statusLower === 'todo') return 'todo';
    if (statusLower === 'in progress' || statusLower === 'in-progress') return 'in-progress';
    if (statusLower === 'completed' || statusLower === 'done') return 'done';
    return 'todo'; // Default value
  };

  // Helper function to map database priority values to our internal enum
  const mapPriorityValue = (priority: string): 'low' | 'medium' | 'high' => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'low') return 'low';
    if (priorityLower === 'medium') return 'medium';
    if (priorityLower === 'high') return 'high';
    return 'medium'; // Default value
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Filter by completion
    if (!showCompleted) {
      filtered = filtered.filter(task => task.status !== 'done');
    }
    
    // Sort tasks
    filtered.sort((a, b) => {
      if (sortField === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      } 
      
      if (sortField === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        const aValue = priorityOrder[a.priority as 'low' | 'medium' | 'high'] || 0;
        const bValue = priorityOrder[b.priority as 'low' | 'medium' | 'high'] || 0;
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Default sort by deadline
      const aDate = a.deadline ? new Date(a.deadline).getTime() : 0;
      const bDate = b.deadline ? new Date(b.deadline).getTime() : 0;
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    });
    
    setFilteredTasks(filtered);
  };

  const toggleTaskExpand = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, expanded: !task.expanded } 
          : task
      )
    );
  };

  const getTaskPosition = (task: GanttTask) => {
    const startDate = task.startDate || new Date(task.created_at);
    const firstDate = days[0];
    
    // Calculate the offset in days from the first day shown
    const diffTime = startDate.getTime() - firstDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate width based on task duration
    const duration = task.duration || 1;
    const dayWidth = 100 / days.length;
    
    return {
      left: `${Math.max(0, diffDays * dayWidth)}%`,
      width: `${Math.min(duration * dayWidth, 100 - (diffDays * dayWidth))}%`
    };
  };

  const getTaskColorByPriority = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const renderGanttHeaders = () => (
    <div className="grid grid-cols-[250px_minmax(0,1fr)] border-b">
      <div className="p-3 font-medium border-r">Task</div>
      <div className="relative">
        <div className="flex">
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`flex-1 text-center p-2 text-xs border-r last:border-r-0 ${
                day.getDay() === 0 || day.getDay() === 6 ? 'bg-gray-100' : ''
              }`}
            >
              {day.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                weekday: timeframe === 'week' ? 'short' : undefined
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGanttRows = () => (
    <div className="overflow-y-auto max-h-[500px]">
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No tasks match your filters
        </div>
      ) : (
        filteredTasks.map(task => (
          <div 
            key={task.id} 
            className="grid grid-cols-[250px_minmax(0,1fr)] border-b hover:bg-muted/30"
          >
            <div className="p-3 border-r flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 mr-2" 
                onClick={() => toggleTaskExpand(task.id)}
              >
                {task.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <span className="truncate">{task.title}</span>
            </div>
            <div className="relative h-10">
              {/* Draw timeline grid */}
              <div className="absolute inset-0 flex">
                {days.map((day, index) => (
                  <div 
                    key={index} 
                    className={`flex-1 border-r last:border-r-0 ${
                      day.getDay() === 0 || day.getDay() === 6 ? 'bg-gray-100' : ''
                    }`}
                  />
                ))}
              </div>
              
              {/* Draw task bar */}
              <div
                className={`absolute top-1 h-8 rounded ${getTaskColorByPriority(task.priority)} opacity-80 shadow-sm`}
                style={getTaskPosition(task)}
              >
                <div className="h-full flex items-center justify-start px-2 text-white text-xs truncate">
                  {task.title}
                </div>
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card className="w-full shadow-md">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                Clear
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="gap-1"
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setShowCompleted(!showCompleted)}>
                <Checkbox checked={showCompleted} className="mr-2 h-4 w-4" />
                Show Completed
              </Button>
            </div>
          </div>
        </div>
        
        <div className="overflow-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading tasks...</p>
            </div>
          ) : (
            <>
              {renderGanttHeaders()}
              {renderGanttRows()}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
