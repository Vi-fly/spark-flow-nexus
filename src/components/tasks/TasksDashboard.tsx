
import React, { useState, useEffect } from 'react';
import { PlusCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getAllTasks, Task } from '@/services/taskService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TaskForm } from './TaskForm';

/**
 * TasksDashboard component - Main task management interface
 * 
 * Features:
 * - Displays all tasks with filtering capabilities
 * - Enables adding new tasks
 * - Provides searching, filtering by priority and status
 * - Responsive grid layout for task cards
 */
export function TasksDashboard() {
  // Task and filter state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Dialog state for new task form
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  
  // Access auth and toast context
  const { user } = useAuth();
  const { toast } = useToast();
  
  /**
   * Filter tasks based on current filters and search term
   */
  const filteredTasks = tasks.filter(task => {
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesPriority && matchesStatus && matchesSearch;
  });

  /**
   * Fetch tasks on component mount or when user changes
   */
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (user) {
          setLoading(true);
          const data = await getAllTasks();
          setTasks(data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tasks',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, toast]);

  /**
   * Handle tasks added/updated event
   */
  const handleTasksChanged = async () => {
    try {
      // Fetch updated tasks list
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button 
          className="hover-scale flex items-center gap-2"
          onClick={() => setIsTaskFormOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          New Task
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>
        
        <div className="w-full sm:w-32">
          <Select
            value={priorityFilter}
            onValueChange={setPriorityFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-36">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Tasks grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onTaskUpdated={handleTasksChanged}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No tasks found matching your filters.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setPriorityFilter('all');
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Task creation form dialog */}
      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        onTaskAdded={handleTasksChanged}
      />
    </div>
  );
}
