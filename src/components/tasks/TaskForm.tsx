
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Contact, getAllContacts } from '@/services/contactService';
import { createTask, TaskInput, updateTask } from '@/services/taskService';
import { Task } from '@/types/database.types';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Props for TaskForm component
type TaskFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
  editTask?: Task;
};

// Helper function to map external status values to our internal enum
type DatabaseStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Reviewed & Approved';
// type UIStatus = 'todo' | 'in-progress' | 'on-hold' | 'completed' | 'reviewed-approved';

// // UI → Database conversion
// const mapStatusToInternalValue = (status: string): DatabaseStatus => {
//   const reverseMap: Record<UIStatus, DatabaseStatus> = {
//     'todo': 'Not Started',
//     'in-progress': 'In Progress',
//     'on-hold': 'On Hold',
//     'completed': 'Completed',
//     'reviewed-approved': 'Reviewed & Approved'
//   };
  
//   return reverseMap[status] || 'Not Started';
// };

// Helper function to map external priority values to our internal enum
// const mapPriorityToInternalValue = (priority: string): 'Low' | 'Medium' | 'High' => {
//   if (priority && typeof priority === 'string') {
//     const priorityLower = priority.toLowerCase();
//     if (priorityLower === 'low') return 'Low';
//     if (priorityLower === 'medium') return 'Medium';
//     if (priorityLower === 'high') return 'High';
//   }
//   return 'Medium'; // Default value
// };

/**
 * TaskForm component - Form for creating or editing tasks
 */
export function TaskForm({ open, onOpenChange, onTaskAdded, editTask }: TaskFormProps) {
  // Task form state
  const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [category, setCategory] = useState('');
const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
const [expectedOutcome, setExpectedOutcome] = useState('');
const [deadline, setDeadline] = useState<Date>(new Date());
const [assignedToId, setAssignedToId] = useState<number | undefined>(undefined);
const [dependencies, setDependencies] = useState<string>('');
const [requiredResources, setRequiredResources] = useState<string>('');
const [estimatedTime, setEstimatedTime] = useState('');
const [instructions, setInstructions] = useState('');
const [reviewProcess, setReviewProcess] = useState('');
const [performanceMetrics, setPerformanceMetrics] = useState<string>('');
const [supportContactId, setSupportContactId] = useState<number | undefined>(undefined);
const [notes, setNotes] = useState('');
const [status, setStatus] = useState<"Not Started" | "In Progress" | "On Hold" | "Completed" | "Reviewed & Approved">("Not Started");
  
  // Contacts list for dropdown
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    assignedToId: '',
    description: '',
    category: '',
    instructions: ''
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


  useEffect(() => {
    if (!open) {
      resetForm();
      setCurrentPage(1);
    }
  }, [open]);



  const sanitizeInput = (value: string | null) => {
    if (!value) return '';
    // Remove extra quotes and backslashes
    return value.replace(/^"+|"+$/g, '').replace(/\\+/g, '');
  };
  
  // Set form values when editing a task
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setCategory(editTask.category || '');
      setPriority(editTask.priority as 'Low' | 'Medium' | 'High');
      setExpectedOutcome(editTask.expected_outcome || '');
      setDeadline(new Date(editTask.deadline));  // Required field per schema
      setAssignedToId(Number(editTask.assigned_to));  // Required field
      setDependencies(sanitizeInput(editTask.dependencies));
      setRequiredResources(sanitizeInput(editTask.required_resources));
      setEstimatedTime(editTask.estimated_time || '');
      setInstructions(editTask.instructions || '');
      setReviewProcess(editTask.review_process || '');
      setPerformanceMetrics(sanitizeInput(editTask.performance_metrics));
      setSupportContactId(editTask.support_contact ? Number(editTask.support_contact) : undefined);
      setNotes(sanitizeInput(editTask.notes || ''));
      setStatus((editTask.status));

    } else {
      resetForm();
    }
  }, [editTask, open]);
  
  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setStatus("Not Started");
    setPriority('Medium');
    setExpectedOutcome('');
    setDeadline(undefined);  // Consider setting to default date if required
    setAssignedToId(undefined);
    setDependencies('');
    setRequiredResources('');
    setEstimatedTime('');
    setInstructions('');
    setReviewProcess('');
    setPerformanceMetrics('');
    setSupportContactId(undefined);  // Changed from contactId to supportContactId
    setNotes('');
    setErrors({ title: '', assignedToId: '', description: '', category: '', instructions: '' });
  };
  


  



  // Validate form before submission
 
  

  const [currentPage, setCurrentPage] = useState(1);
  const [isManualSubmission, setIsManualSubmission] = useState(false);


  const validatePage1 = React.useCallback(() => {
    const newErrors = {
      title: '',
      assignedToId: '',
      description: ''
    };
    let isValid = true;
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!assignedToId) {
      newErrors.assignedToId = 'Assignee is required';
      isValid = false;
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  }, [title, assignedToId, description]);
  
  const validatePage2 = () => {
    const newErrors = {
      category: '',
      instructions: ''
    };
    let isValid = true;
    
    if (!category.trim()) {
      newErrors.category = 'Category is required';
      isValid = false;
    }
    
    if (!instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
      isValid = false;
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isManualSubmission || currentPage !== 2) return;
  
  // Reset submission flag
    setIsManualSubmission(false);

    // Validate fields
    if (!validatePage1() || !validatePage2()) return;

    // Show confirmation only once
    if (editTask && !window.confirm('Are you sure you want to update this task?')) {
      return;
    }


    setIsSubmitting(true);
    
    try {
      // Prepare task data
      const taskData: TaskInput = {
        title,
        description: description || '',
        category: category || '',
        status,
        priority,
        expected_outcome: expectedOutcome || '',
        deadline: deadline.toISOString(),  // Required by schema
        estimated_time: estimatedTime || '',
        assigned_to: assignedToId ?? 0,  // Required by schema
        dependencies: dependencies,
        required_resources: requiredResources,
        instructions: instructions || '',
        review_process: reviewProcess || '',
        performance_metrics: performanceMetrics,
        support_contact: supportContactId || null,
        notes: notes || null,

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


  useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Only handle page navigation, not submission
        if (currentPage === 1 && validatePage1()) {
          setCurrentPage(2);
        }
      }
    };
  
    document.addEventListener('keydown', handleEnterKey);
    return () => document.removeEventListener('keydown', handleEnterKey);
  }, [currentPage, validatePage1]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {editTask ? 'Update the task details' : 'Create a new task'}
          </DialogDescription>
        </DialogHeader>
        
        <form  id="task-form" onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex justify-center space-x-2 mb-4">
            <div className={`h-2 w-8 rounded-full ${currentPage === 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-8 rounded-full ${currentPage === 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>

          {currentPage === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''} // Add error border
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value: string) => setStatus(value as DatabaseStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Reviewed & Approved">Reviewed & Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value: 'Low' | 'Medium' | 'High') => setPriority(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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
                  <Label htmlFor="estimatedTime">Estimated Time</Label>
                  <Input
                    id="estimatedTime"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="e.g., 2 hours"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To <span className="text-red-500">*</span></Label>
                <Select
                  value={assignedToId?.toString() ?? ""}
                  onValueChange={(value) => setAssignedToId(value ? Number(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={String(contact.id)}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignedToId && <p className="text-red-500 text-sm">{errors.assignedToId}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={errors.category ? 'border-red-500' : ''} // Add error border
                />
                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
              </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedOutcome">Expected Outcome</Label>
                  <Input
                    id="expectedOutcome"
                    value={expectedOutcome}
                    onChange={(e) => setExpectedOutcome(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions <span className="text-red-500">*</span></Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  className={errors.instructions ? 'border-red-500' : ''} // Add error border
                />
                {errors.instructions && <p className="text-red-500 text-sm">{errors.instructions}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dependencies">Dependencies</Label>
                  <Input
                    id="dependencies"
                    value={dependencies}
                    onChange={(e) => setDependencies(sanitizeInput(e.target.value))} 
                    placeholder="Comma-separated dependencies"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredResources">Required Resources</Label>
                  <Input
                    id="requiredResources"
                    value={requiredResources}
                    onChange={(e) => setRequiredResources(sanitizeInput(e.target.value))}
                    placeholder="Comma-separated resources"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewProcess">Review Process</Label>
                <Input
                  id="reviewProcess"
                  value={reviewProcess}
                  onChange={(e) => setReviewProcess(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="performanceMetrics">Performance Metrics</Label>
                <Input
                  id="performanceMetrics"
                  value={performanceMetrics}
                  onChange={(e) => setPerformanceMetrics(sanitizeInput(e.target.value))}
                  placeholder="Comma-separated metrics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportContact">Support Contact</Label>
                <Select
                  value={supportContactId?.toString() ?? ""}
                  onValueChange={(value) => setSupportContactId(value ? Number(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={String(contact.id)}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            {currentPage === 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (validatePage1()) setCurrentPage(2);
                  }}
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentPage(1)}
                >
                  Back
                </Button>
                <Button
                  type="button" // Change to regular button
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsManualSubmission(true);
                    // Trigger form submission manually
                    const form = document.getElementById('task-form') as HTMLFormElement;
                    form.requestSubmit();
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Task'}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}