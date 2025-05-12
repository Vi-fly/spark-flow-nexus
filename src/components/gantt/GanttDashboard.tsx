
import React, { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
  Cell,
  TooltipProps
} from 'recharts';
import { 
  BarChartHorizontal, 
  PieChart as PieChartIcon, 
  CheckSquare,
  Clock,
  Hourglass,
  BarChart4,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';

// Mock data for our visualizations
const mockTasks = [
  { id: "1", title: "Design mockups", status: "done", priority: "high", deadline: new Date().toISOString(), assignedTo: "John Doe" },
  { id: "2", title: "Database schema", status: "in-progress", priority: "medium", deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), assignedTo: "Jane Smith" },
  { id: "3", title: "API implementation", status: "todo", priority: "high", deadline: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), assignedTo: "Bob Johnson" },
  { id: "4", title: "Frontend development", status: "todo", priority: "medium", deadline: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), assignedTo: "Alice Brown" },
  { id: "5", title: "Testing", status: "todo", priority: "low", deadline: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(), assignedTo: "Charlie Green" },
  { id: "6", title: "Documentation", status: "todo", priority: "low", deadline: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), assignedTo: "Diana White" },
  { id: "7", title: "Deployment", status: "todo", priority: "high", deadline: new Date(new Date().setDate(new Date().getDate() + 16)).toISOString(), assignedTo: "Evan Black" },
  { id: "8", title: "User testing", status: "todo", priority: "medium", deadline: new Date(new Date().setDate(new Date().getDate() + 18)).toISOString(), assignedTo: "Fiona Gray" }
];

export const GanttDashboard = () => {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = mockTasks.length;
    const completed = mockTasks.filter(t => t.status === 'done').length;
    const inProgress = mockTasks.filter(t => t.status === 'in-progress').length;
    const todo = mockTasks.filter(t => t.status === 'todo').length;
    const highPriority = mockTasks.filter(t => t.priority === 'high').length;
    
    return {
      totalTasks,
      completed,
      inProgress,
      todo,
      highPriority,
      completionRate: Math.round((completed / totalTasks) * 100)
    };
  }, []);

  // Data for status distribution chart
  const statusData = [
    { name: 'Done', value: stats.completed, color: '#22c55e' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { name: 'To Do', value: stats.todo, color: '#94a3b8' }
  ];

  // Data for priority distribution chart
  const priorityData = [
    { name: 'High', value: mockTasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: mockTasks.filter(t => t.priority === 'medium').length, color: '#f97316' },
    { name: 'Low', value: mockTasks.filter(t => t.priority === 'low').length, color: '#22c55e' }
  ];

  // Data for assignee workload chart
  const assigneeData = useMemo(() => {
    const assignees = {};
    mockTasks.forEach(task => {
      if (!assignees[task.assignedTo]) {
        assignees[task.assignedTo] = 0;
      }
      assignees[task.assignedTo]++;
    });
    
    return Object.entries(assignees).map(([name, value]) => ({ name, value }));
  }, []);

  // Timeline data (tasks per week)
  const timelineData = [
    { week: 'Week 1', tasks: 2 },
    { week: 'Week 2', tasks: 3 },
    { week: 'Week 3', tasks: 4 },
    { week: 'Week 4', tasks: 2 },
    { week: 'Week 5', tasks: 1 }
  ];

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded shadow-lg p-2 text-xs">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <BarChart4 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <CheckSquare className="h-5 w-5 text-green-500" />
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <Hourglass className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.highPriority}</div>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main charts */}
      <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            <Card className="w-full h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Task Status Distribution
                </CardTitle>
                <CardDescription>
                  Overview of tasks by their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            <Card className="w-full h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChartHorizontal className="h-5 w-5" />
                  Team Workload
                </CardTitle>
                <CardDescription>
                  Task distribution across team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={assigneeData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8884d8" barSize={20} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Secondary charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Project Timeline
            </CardTitle>
            <CardDescription>
              Tasks distribution over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={timelineData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="tasks" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
            <CardDescription>
              Tasks by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
