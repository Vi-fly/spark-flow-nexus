
import React, { useState } from 'react';
import { PlusCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard, Task } from './TaskCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Sample data
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Redesign landing page',
    description: 'Update the website landing page with new branding guidelines and improve mobile responsiveness.',
    deadline: new Date('2025-05-15'),
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'Alex Johnson',
    estimatedTime: '4 days',
  },
  {
    id: '2',
    title: 'Update user documentation',
    description: 'Create comprehensive documentation for the new feature set that will be released next month.',
    deadline: new Date('2025-05-20'),
    priority: 'medium',
    status: 'todo',
    assignedTo: 'Sarah Williams',
    estimatedTime: '2 days',
  },
  {
    id: '3',
    title: 'Fix navigation bug',
    description: 'Fix the navigation issue on mobile devices where the menu doesn't close after selection.',
    deadline: new Date('2025-04-10'),
    priority: 'high',
    status: 'done',
    assignedTo: 'Michael Chen',
    estimatedTime: '1 day',
  },
  {
    id: '4',
    title: 'Create email templates',
    description: 'Design and code email templates for the newsletter system based on the new brand guidelines.',
    deadline: new Date('2025-05-12'),
    priority: 'low',
    status: 'todo',
    assignedTo: 'Emily Davis',
    estimatedTime: '3 days',
  },
  {
    id: '5',
    title: 'Quarterly performance review',
    description: 'Prepare performance metrics and feedback for the team\'s quarterly review session.',
    deadline: new Date('2025-04-30'),
    priority: 'medium',
    status: 'in-progress',
    assignedTo: 'Robert Wilson',
    estimatedTime: '2 days',
  },
  {
    id: '6',
    title: 'API documentation',
    description: 'Update the API documentation to reflect recent changes and additions to the endpoints.',
    deadline: new Date('2025-05-05'),
    priority: 'medium',
    status: 'todo',
    estimatedTime: '3 days',
  },
];

export function TasksDashboard() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTasks = tasks.filter(task => {
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPriority && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button className="hover-scale flex items-center gap-2">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
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
    </div>
  );
}
