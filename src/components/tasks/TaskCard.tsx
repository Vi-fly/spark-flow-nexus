
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { deleteTask, updateTask } from '@/services/taskService';
import { Task } from '@/types/database.types';
import { format } from 'date-fns';
import { Calendar, Check, Clock, Edit, MoreVertical, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { TaskForm } from './TaskForm';


// Props for TaskCard component
type TaskCardProps = {
  task: Task;
  className?: string;
  onTaskUpdated: () => void;
};

/**
 * TaskCard component - Displays a single task with actions
 * 
 * Features:
 * - Displays task information in a card layout
 * - Shows status, priority, deadline, and assignment
 * - Provides dropdown menu for task actions (edit, delete, status change)
 * - Confirms deletion with an alert dialog
 */


export function TaskCard({ task, className, onTaskUpdated }: TaskCardProps) {
  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  
  // Define visual classes for priority and status
  const priorityClass = {
    Low: 'border-l-green-500',
    Medium: 'border-l-amber-500',
    High: 'border-l-red-500',
  };


  

  const statusClass = {
    'Not Started': 'bg-slate-100 text-slate-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'On Hold': 'bg-amber-100 text-amber-700',
    'Completed': 'bg-green-100 text-green-700',
    'Reviewed & Approved': 'bg-emerald-100 text-emerald-700',
  };

  const statusText = {
    'Not Started': 'Not Started',
    'In Progress': 'In Progress',
    'On Hold': 'On Hold',
    'Completed': 'Completed',
    'Reviewed & Approved': 'Reviewed & Approved',
  };



  // Add this helper function at the top of TaskCard
  const mapStatusForDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'Not Started': 'Not Started',
      'In Progress': 'In Progress',
      'On Hold': 'On Hold',
      'Completed': 'Completed',
      'Reviewed & Approved': 'Reviewed & Approved',
      // Add any backend-specific mappings if needed
    };
    return statusMap[status] || status;
  };

  // Update the Badge component
  <Badge className={cn('mr-2', statusClass[task.status])}>
    {mapStatusForDisplay(task.status)}
  </Badge>

  /**
   * Handle task status change
   */
  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      const updatedTask = await updateTask(task.id, { status: newStatus });
      
      if (updatedTask) {
        onTaskUpdated();
        toast({
          title: 'Status Updated',
          description: `Changed to ${newStatus}`,
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Status update failed:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Could not update status',
        variant: 'destructive'
      });
    }
  };

  /**
   * Handle task deletion
   */
  const handleDeleteTask = async () => {
    try {
      await deleteTask(task.id);
      onTaskUpdated();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <>
      <div 
        className={cn(
          'border rounded-md p-4 shadow-sm hover:shadow-md transition-shadow',
          `border-l-4 ${priorityClass[task.priority]}`,
          className
        )}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{task.title}</h3>
          
          {/* Task actions dropdown */}
          <div className="flex items-center">
            <Badge className={cn('mr-2', statusClass[task.status])}>
              {statusText[task.status]}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Edit option */}
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                
                {/* Status change options */}
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('Not Started')}
                  disabled={task.status === 'Not Started'}
                >
                  <span className="h-2 w-2 rounded-full bg-slate-400 mr-2" />
                  Mark as Not Started
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('In Progress')}
                  disabled={task.status === 'In Progress'}
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('On Hold')}  // Fixed status
                  disabled={task.status === 'On Hold'}
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500 mr-2" />
                  Mark as On Hold
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('Completed')}
                  disabled={task.status === 'Completed'}
                >
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('Reviewed & Approved')}
                  disabled={task.status === 'Reviewed & Approved'}
                >
                  <Check className="h-4 w-4 mr-2 text-emerald-600" /> 
                  Mark as Reviewed & Approved
                </DropdownMenuItem>
                
                {/* Delete option */}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Task description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {task.description || 'No description provided'}
        </p>
        
        {/* Task metadata */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {task.deadline && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{format(new Date(task.deadline), 'MMM d, yyyy')}</span>
            </div>
          )}
          
          {task.estimated_time && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{task.estimated_time}</span>
            </div>
          )}
          
          {task.assigned_to && (
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>{task.assigned_to}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit task dialog */}
      <TaskForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onTaskAdded={onTaskUpdated}
        editTask={task}
      />
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
