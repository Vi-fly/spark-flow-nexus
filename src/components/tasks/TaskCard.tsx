
import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type Task = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  assignedTo?: string;
  estimatedTime?: string;
};

type TaskCardProps = {
  task: Task;
  className?: string;
};

export function TaskCard({ task, className }: TaskCardProps) {
  const priorityClass = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
  };

  const statusClass = {
    'todo': 'status-todo',
    'in-progress': 'status-in-progress',
    'done': 'status-done',
  };

  const statusText = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  };

  return (
    <div 
      className={cn(
        'task-card hover-lift animate-fade-in',
        priorityClass[task.priority],
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{task.title}</h3>
        <Badge className={cn('status-badge', statusClass[task.status])}>
          {statusText[task.status]}
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{task.description}</p>
      
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{task.deadline.toLocaleDateString()}</span>
        </div>
        
        {task.estimatedTime && (
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{task.estimatedTime}</span>
          </div>
        )}
        
        {task.assignedTo && (
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            <span>{task.assignedTo}</span>
          </div>
        )}
      </div>
    </div>
  );
}
