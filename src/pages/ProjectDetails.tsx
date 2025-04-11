
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const mockProject = {
  id: "project-1",
  name: "Website Redesign",
  description: "Complete overhaul of the company website with modern design and improved user experience",
  startDate: "2025-03-15",
  endDate: "2025-06-30",
  status: "in-progress",
  progress: 35,
  manager: {
    name: "Alice Smith",
    avatar: "/placeholder.svg"
  },
  team: [
    { name: "John Doe", avatar: "/placeholder.svg", role: "Designer" },
    { name: "Jane Smith", avatar: "/placeholder.svg", role: "Developer" },
    { name: "Mike Johnson", avatar: "/placeholder.svg", role: "QA Engineer" },
    { name: "Sarah Williams", avatar: "/placeholder.svg", role: "Content Writer" }
  ],
  tasks: [
    { id: "1", title: "Design mockups", status: "done", priority: "high", deadline: "2025-04-01", assignedTo: "John Doe", progress: 100 },
    { id: "2", title: "Database schema", status: "in-progress", priority: "medium", deadline: "2025-04-15", assignedTo: "Jane Smith", progress: 60 },
    { id: "3", title: "API implementation", status: "todo", priority: "high", deadline: "2025-05-01", assignedTo: "Jane Smith", progress: 0 },
    { id: "4", title: "Frontend development", status: "in-progress", priority: "medium", deadline: "2025-05-15", assignedTo: "John Doe", progress: 30 },
    { id: "5", title: "Content creation", status: "in-progress", priority: "medium", deadline: "2025-05-10", assignedTo: "Sarah Williams", progress: 40 },
    { id: "6", title: "Testing & QA", status: "todo", priority: "high", deadline: "2025-06-01", assignedTo: "Mike Johnson", progress: 0 },
    { id: "7", title: "Deployment", status: "todo", priority: "medium", deadline: "2025-06-15", assignedTo: "Jane Smith", progress: 0 }
  ],
  milestones: [
    { id: "m1", title: "Design Approval", date: "2025-04-10", status: "completed" },
    { id: "m2", title: "Backend Development", date: "2025-05-15", status: "pending" },
    { id: "m3", title: "Frontend Development", date: "2025-06-01", status: "pending" },
    { id: "m4", title: "Launch", date: "2025-06-30", status: "pending" }
  ],
  documents: [
    { id: "d1", title: "Project Brief", type: "pdf", uploadedBy: "Alice Smith", date: "2025-03-15" },
    { id: "d2", title: "Design Specifications", type: "doc", uploadedBy: "John Doe", date: "2025-03-25" },
    { id: "d3", title: "Technical Requirements", type: "doc", uploadedBy: "Jane Smith", date: "2025-04-01" }
  ],
  discussions: [
    { id: "disc1", title: "Homepage Layout Discussion", messages: 12, lastActivity: "2025-04-02" },
    { id: "disc2", title: "Mobile Responsiveness", messages: 8, lastActivity: "2025-04-08" },
    { id: "disc3", title: "Backend API Structure", messages: 15, lastActivity: "2025-04-12" }
  ]
};

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project] = useState(mockProject);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not-started':
        return <Badge variant="outline">Not Started</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'on-hold':
        return <Badge variant="destructive" className="bg-amber-100 text-amber-800">On Hold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/gantt')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
            </span>
            {getStatusBadge(project.status)}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{project.description}</p>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {project.milestones.map((milestone) => (
                        <li key={milestone.id} className="flex items-start gap-4">
                          {milestone.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{milestone.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(milestone.date).toLocaleDateString()}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Task Status</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-green-100 text-green-800 rounded p-2">
                          <p className="text-lg font-bold">
                            {project.tasks.filter(t => t.status === 'done').length}
                          </p>
                          <p className="text-xs">Completed</p>
                        </div>
                        <div className="bg-blue-100 text-blue-800 rounded p-2">
                          <p className="text-lg font-bold">
                            {project.tasks.filter(t => t.status === 'in-progress').length}
                          </p>
                          <p className="text-xs">In Progress</p>
                        </div>
                        <div className="bg-slate-100 text-slate-800 rounded p-2">
                          <p className="text-lg font-bold">
                            {project.tasks.filter(t => t.status === 'todo').length}
                          </p>
                          <p className="text-xs">To Do</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Tasks</CardTitle>
                  <CardDescription>
                    Manage and track all tasks for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-5">Task</div>
                      <div className="col-span-2">Assignee</div>
                      <div className="col-span-2">Due Date</div>
                      <div className="col-span-1">Priority</div>
                      <div className="col-span-2">Progress</div>
                    </div>
                    {project.tasks.map((task) => (
                      <div key={task.id} className="grid grid-cols-12 p-3 text-sm border-t items-center">
                        <div className="col-span-5">
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getStatusBadge(task.status)}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="/placeholder.svg" alt={task.assignedTo} />
                              <AvatarFallback>{task.assignedTo.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{task.assignedTo}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-xs">
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                        <div className="col-span-1">
                          {getPriorityBadge(task.priority)}
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <Progress value={task.progress} className="h-2 flex-1" />
                            <span className="text-xs font-medium w-7 text-right">{task.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="team" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Team</CardTitle>
                  <CardDescription>
                    People working on this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Project Manager</h3>
                      <div className="flex items-center gap-4 p-3 rounded-md border">
                        <Avatar>
                          <AvatarImage src={project.manager.avatar} alt={project.manager.name} />
                          <AvatarFallback>{project.manager.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{project.manager.name}</p>
                          <p className="text-sm text-muted-foreground">Project Manager</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Team Members</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.team.map((member, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 rounded-md border">
                            <Avatar>
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Documents</CardTitle>
                  <CardDescription>
                    Important files and documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-8 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-4">Name</div>
                      <div className="col-span-2">Uploaded By</div>
                      <div className="col-span-2">Date</div>
                    </div>
                    {project.documents.map((doc) => (
                      <div key={doc.id} className="grid grid-cols-8 p-3 text-sm border-t items-center">
                        <div className="col-span-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">{doc.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground ml-7 mt-1">
                            {doc.type.toUpperCase()}
                          </div>
                        </div>
                        <div className="col-span-2">{doc.uploadedBy}</div>
                        <div className="col-span-2 text-xs">
                          {new Date(doc.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="discussions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Discussions</CardTitle>
                  <CardDescription>
                    Team discussions and communications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.discussions.map((discussion) => (
                      <div key={discussion.id} className="flex items-start gap-3 p-3 rounded-md border">
                        <MessageSquare className="h-5 w-5 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{discussion.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {discussion.messages} messages
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last activity: {new Date(discussion.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="col-span-3 lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p>{getStatusBadge(project.status)}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Project Manager</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={project.manager.avatar} alt={project.manager.name} />
                    <AvatarFallback>{project.manager.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm">{project.manager.name}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Team Size</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{project.team.length} members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Today</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-4 border-l-2 border-muted">
                      <div className="relative pl-4">
                        <div className="absolute left-[-9px] top-1 h-3 w-3 rounded-full bg-primary"></div>
                        <p className="text-sm font-medium">Jane Smith updated task "Database schema"</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                      <div className="relative pl-4">
                        <div className="absolute left-[-9px] top-1 h-3 w-3 rounded-full bg-primary"></div>
                        <p className="text-sm font-medium">Mike Johnson commented on "Testing & QA"</p>
                        <p className="text-xs text-muted-foreground">4 hours ago</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Yesterday</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-4 border-l-2 border-muted">
                      <div className="relative pl-4">
                        <div className="absolute left-[-9px] top-1 h-3 w-3 rounded-full bg-primary"></div>
                        <p className="text-sm font-medium">Alice Smith created a new milestone</p>
                        <p className="text-xs text-muted-foreground">Yesterday at 5:30 PM</p>
                      </div>
                      <div className="relative pl-4">
                        <div className="absolute left-[-9px] top-1 h-3 w-3 rounded-full bg-primary"></div>
                        <p className="text-sm font-medium">John Doe completed task "Design mockups"</p>
                        <p className="text-xs text-muted-foreground">Yesterday at 2:15 PM</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
