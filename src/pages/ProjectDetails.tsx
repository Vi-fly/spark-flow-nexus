
import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  MessageSquare, 
  User, 
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { toast } = useToast();
  
  // This would typically come from an API call based on the projectId
  const project = {
    id: projectId,
    name: "Website Redesign Project",
    description: "Complete overhaul of company website with modern design and improved UX",
    status: "in-progress",
    progress: 65,
    startDate: "2024-03-15",
    endDate: "2024-06-30",
    team: [
      { id: "1", name: "John Doe", role: "Project Manager", avatar: "https://i.pravatar.cc/150?img=1" },
      { id: "2", name: "Jane Smith", role: "UX Designer", avatar: "https://i.pravatar.cc/150?img=2" },
      { id: "3", name: "Bob Johnson", role: "Frontend Developer", avatar: "https://i.pravatar.cc/150?img=3" },
      { id: "4", name: "Alice Brown", role: "Backend Developer", avatar: "https://i.pravatar.cc/150?img=4" }
    ],
    tasks: [
      { id: "1", title: "Design mockups", status: "completed", assignee: "Jane Smith", dueDate: "2024-04-01" },
      { id: "2", title: "Frontend implementation", status: "in-progress", assignee: "Bob Johnson", dueDate: "2024-05-15" },
      { id: "3", title: "Backend API development", status: "in-progress", assignee: "Alice Brown", dueDate: "2024-05-30" },
      { id: "4", title: "User testing", status: "not-started", assignee: "John Doe", dueDate: "2024-06-15" }
    ],
    documents: [
      { id: "1", name: "Project Brief.pdf", uploadedBy: "John Doe", uploadDate: "2024-03-15" },
      { id: "2", name: "Design Guidelines.docx", uploadedBy: "Jane Smith", uploadDate: "2024-03-22" },
      { id: "3", name: "Technical Specifications.pdf", uploadedBy: "Alice Brown", uploadDate: "2024-04-05" }
    ],
    discussions: [
      { id: "1", title: "Homepage Design Review", author: "John Doe", date: "2024-04-02", replies: 5 },
      { id: "2", title: "API Endpoint Structure", author: "Alice Brown", date: "2024-04-10", replies: 8 },
      { id: "3", title: "Project Timeline Update", author: "John Doe", date: "2024-04-15", replies: 3 }
    ]
  };
  
  const handleActionClick = (action: string) => {
    toast({
      title: "Action triggered",
      description: `${action} action was clicked`,
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'in-progress':
        return "bg-blue-100 text-blue-800";
      case 'not-started':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleActionClick("Edit Project")}>
            Edit Project
          </Button>
          <Button onClick={() => handleActionClick("Add Task")}>
            Add Task
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="font-semibold capitalize">{project.status.replace('-', ' ')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Start Date</span>
              <span className="font-semibold">{formatDate(project.startDate)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">End Date</span>
              <span className="font-semibold">{formatDate(project.endDate)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Team Size</span>
              <span className="font-semibold">{project.team.length} members</span>
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">Progress</span>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">0%</span>
              <span className="text-xs font-medium">{project.progress}%</span>
              <span className="text-xs text-muted-foreground">100%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="tasks">
            <Clock className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="discussions">
            <MessageSquare className="h-4 w-4 mr-2" />
            Discussions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>Track and manage all tasks for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">Assigned to: {task.assignee}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">Due: {formatDate(task.dueDate)}</div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('-', ' ')}
                      </span>
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
              <CardDescription>Team members working on this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.team.map(member => (
                  <div key={member.id} className="flex items-center p-4 border rounded-lg">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-4">
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Documents</CardTitle>
              <CardDescription>Important files and documents for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">Uploaded by: {doc.uploadedBy}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(doc.uploadDate)}
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
              <CardDescription>Conversations and threads about this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.discussions.map(discussion => (
                  <div key={discussion.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{discussion.title}</div>
                      <div className="text-sm text-muted-foreground">Started by: {discussion.author}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">{formatDate(discussion.date)}</div>
                      <div className="bg-primary-100 text-primary-800 text-xs px-2.5 py-0.5 rounded-full">
                        {discussion.replies} replies
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
