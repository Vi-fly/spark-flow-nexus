import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { databaseService } from '@/services/databaseService';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'task' | 'contact';
  initialData: any;
  onSubmit: (data: any) => void;
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  expected_outcome: z.string().min(1, 'Expected outcome is required'),
  deadline: z.date(),
  assigned_to: z.number().optional().nullable(),
  dependencies: z.string().optional().transform(val => val ? val.split(',').map(d => d.trim()) : []),
  required_resources: z.string().optional().transform(val => val ? val.split(',').map(r => r.trim()) : []),
  estimated_time: z.string().min(1, 'Estimated time is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  review_process: z.string().min(1, 'Review process is required'),
  performance_metrics: z.string().optional(),
  support_contact: z.number().optional().nullable(),
  notes: z.string().optional(),
  status: z.enum(['Not Started', 'In Progress', 'On Hold', 'Completed', 'Reviewed & Approved']).default('Not Started')
});

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().regex(/^\d+$/, 'Phone must contain only numbers').optional().nullable(),
  address: z.string().min(1, 'Address is required'),
  skills: z.array(z.string()).default([]),
  // company: z.string().optional().nullable()
});




const FormDialog: React.FC<FormDialogProps> = ({ open, onOpenChange, type, initialData, onSubmit }) => {
  const [schema, setSchema] = useState<z.ZodType<any>>(taskSchema);
  const [contacts, setContacts] = useState<any[]>([]);
  
  useEffect(() => {
    if (type === 'task') {
      setSchema(taskSchema);
      // Mock contacts data - replace with actual API call
      setContacts([
        { id: 1, name: 'John Doe', skills: ['Development'] },
        { id: 2, name: 'Jane Smith', skills: ['Design'] },
        { id: 3, name: 'Bob Johnson', skills: ['Testing'] },
      ]);
    } else {
      setSchema(contactSchema);
    }
  }, [type]);

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: initialData || (type === 'task' ? {
      title: '',
      description: '',
      category: 'General',
      priority: 'Medium',
      expected_outcome: '',
      deadline: new Date(),
      estimated_time: '1 hour',
      instructions: '',
      review_process: '',
      status: 'Not Started'
    } : {
      name: '',
      email: '',
      phone: '',
      address: '',
      skills: [],
      // company: ''
    }),
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
    onOpenChange(false);
  };

  // In FormDialog component
  useEffect(() => {
    const loadContacts = async () => {
      const contacts = await databaseService.getTableData('contacts');
      setContacts(contacts);
    };
    loadContacts();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{type === 'task' ? 'Task Details' : 'Contact Details'}</DialogTitle>
          <DialogDescription>
            {type === 'task' ? 'Complete all required task information' : 'Provide contact details'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {type === 'task' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title*</FormLabel>
                        <FormControl>
                          <Input placeholder="Task title" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <FormControl>
                          <Input placeholder="Task category" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed description" {...field} rows={3} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Reviewed & Approved">Reviewed & Approved</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Deadline*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline">
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                <CalendarIcon className="ml-2 h-4 w-4" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimated_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Time*</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input placeholder="2 hours" {...field} />
                            <Clock className="h-4 w-4 opacity-50" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assigned_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned To</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select assignee" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {contacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id.toString()}>
                                {contact.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="support_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Contact</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select support contact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {contacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id.toString()}>
                                {contact.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions*</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Step-by-step instructions" {...field} rows={3} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dependencies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dependencies</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Comma-separated task dependencies"
                          value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                          onChange={(e) => field.onChange(e.target.value.split(',').map(d => d.trim()))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="required_resources"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Resources</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Comma-separated resources needed"
                          value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                          onChange={(e) => field.onChange(e.target.value.split(',').map(r => r.trim()))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="review_process"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Process*</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Review criteria and process" {...field} rows={2} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address*</FormLabel>
                        <FormControl>
                          <Input placeholder="Full street address"{...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" type="email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" type="tel" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Anything important (Optional)" {...field} rows={2} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Add skills (comma separated)"
                          value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                          onChange={(e) => {
                            const values = e.target.value
                              .split(',')
                              .map(s => s.trim())
                              .filter(s => s.length > 0);
                            field.onChange(values);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {type === 'task' ? 'Save Task' : 'Save Contact'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;