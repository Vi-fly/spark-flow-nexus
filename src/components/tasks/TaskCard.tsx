
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Clock, User, MoreVertical, Edit, Trash2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
import { Task, updateTask, deleteTask } from '@/services/taskService';
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
  
  // Define visual classes for priority and status
  const priorityClass = {
    low: 'border-l-green-500',
    medium: 'border-l-amber-500',
    high: 'border-l-red-500',
  };

  const statusClass = {
    'todo': 'bg-slate-100 text-slate-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'done': 'bg-green-100 text-green-700',
  };

  const statusText = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  };

  /**
   * Handle task status change
   */
  const handleStatusChange = async (newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
      await updateTask(task.id, { status: newStatus });
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task status:', error);
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
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('todo')}
                  disabled={task.status === 'todo'}
                >
                  <span className="h-2 w-2 rounded-full bg-slate-500 mr-2" />
                  Mark as To Do
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('in-progress')}
                  disabled={task.status === 'in-progress'}
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('done')}
                  disabled={task.status === 'done'}
                >
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Mark as Done
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
