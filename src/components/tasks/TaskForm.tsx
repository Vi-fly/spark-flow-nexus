
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createTask, updateTask, TaskInput, Task } from '@/services/taskService';
import { getAllContacts, Contact } from '@/services/contactService';

// Props for TaskForm component
type TaskFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
  editTask?: Task;
};

// Helper function to map external status values to our internal enum
const mapStatusToInternalValue = (status: string): 'todo' | 'in-progress' | 'done' => {
  if (status && typeof status === 'string') {
    const statusLower = status.toLowerCase();
    if (statusLower === 'not started' || statusLower === 'todo') return 'todo';
    if (statusLower === 'in progress' || statusLower === 'in-progress') return 'in-progress';
    if (statusLower === 'completed' || statusLower === 'done' || statusLower === 'reviewed & approved') return 'done';
  }
  return 'todo'; // Default value
};

// Helper function to map external priority values to our internal enum
const mapPriorityToInternalValue = (priority: string): 'low' | 'medium' | 'high' => {
  if (priority && typeof priority === 'string') {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'low') return 'low';
    if (priorityLower === 'medium') return 'medium';
    if (priorityLower === 'high') return 'high';
  }
  return 'medium'; // Default value
};

/**
 * TaskForm component - Form for creating or editing tasks
 */
export function TaskForm({ open, onOpenChange, onTaskAdded, editTask }: TaskFormProps) {
  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [assignedToId, setAssignedToId] = useState<string | undefined>(undefined);
  const [contactId, setContactId] = useState<string | undefined>(undefined);
  
  // Contacts list for dropdown
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
  });
  
  // Load contacts on mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const contactsData = await getAllContacts();
        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    
    fetchContacts();
  }, []);
  
  // Set form values when editing a task
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setStatus(mapStatusToInternalValue(editTask.status));
      setPriority(mapPriorityToInternalValue(editTask.priority));
      setDeadline(editTask.deadline ? new Date(editTask.deadline) : undefined);
      setEstimatedTime(editTask.estimated_time || '');
      setAssignedToId(editTask.assigned_to || undefined);
      setContactId(editTask.contact_id || undefined);
    } else {
      resetForm();
    }
  }, [editTask, open]);
  
  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setDeadline(undefined);
    setEstimatedTime('');
    setAssignedToId(undefined);
    setContactId(undefined);
    setErrors({ title: '' });
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = { title: '' };
    let isValid = true;
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare task data
      const taskData: TaskInput = {
        title,
        description: description || null,
        status,
        priority,
        deadline: deadline ? deadline.toISOString() : null,
        estimated_time: estimatedTime || null,
        assigned_to: assignedToId || null,
        contact_id: contactId || null,
      };
      
      if (editTask) {
        // Update existing task
        await updateTask(editTask.id, taskData);
      } else {
        // Create new task
        await createTask(taskData);
      }
      
      // Close dialog and notify parent
      resetForm();
      onOpenChange(false);
      onTaskAdded();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {editTask 
              ? 'Update the details of your task below' 
              : 'Fill in the details to create a new task'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>
          
          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>
          
          {/* Status and Priority fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'todo' | 'in-progress' | 'done') => setStatus(value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Deadline and Estimated Time fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">
                Estimated Time <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="estimatedTime"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g., 2 hours, 3 days"
              />
            </div>
          </div>
          
          {/* Assignment fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">
                Assigned To <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Select 
                value={assignedToId} 
                onValueChange={setAssignedToId}
              >
                <SelectTrigger id="assignedTo">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not assigned</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relatedContact">
                Related Contact <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Select 
                value={contactId} 
                onValueChange={setContactId}
              >
                <SelectTrigger id="relatedContact">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No related contact</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Form actions */}
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Saving...' 
                : editTask ? 'Update Task' : 'Create Task'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
