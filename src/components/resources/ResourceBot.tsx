
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bot, Brain, Cpu, Database, Filter, Lightbulb, Loader2, RefreshCw, Search, User, Users } from 'lucide-react';
import { Contact } from '@/types/database.types';
import { databaseConnector } from '@/utils/databaseConnector';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'domain';
  level: number; // 1-5
}

interface ContactWithSkills extends Contact {
  skills: Skill[];
  availability: number; // 0-100%
}

interface Task {
  id: string;
  title: string;
  description: string;
  requiredSkills: Skill[];
  assignedTo: string | null;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
}

export const ResourceBot = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactWithSkills[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactWithSkills[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [botResponse, setBotResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('team');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, you would fetch from an API
        // For demo purposes, we'll create mock data
        const technicalSkills: Skill[] = [
          { id: "s1", name: "React", category: "technical", level: 5 },
          { id: "s2", name: "TypeScript", category: "technical", level: 4 },
          { id: "s3", name: "Node.js", category: "technical", level: 4 },
          { id: "s4", name: "Python", category: "technical", level: 3 },
          { id: "s5", name: "Django", category: "technical", level: 3 },
          { id: "s6", name: "UI Design", category: "technical", level: 4 },
          { id: "s7", name: "Database", category: "technical", level: 3 },
          { id: "s8", name: "DevOps", category: "technical", level: 2 },
        ];
        
        const softSkills: Skill[] = [
          { id: "s9", name: "Communication", category: "soft", level: 4 },
          { id: "s10", name: "Leadership", category: "soft", level: 3 },
          { id: "s11", name: "Teamwork", category: "soft", level: 5 },
          { id: "s12", name: "Problem Solving", category: "soft", level: 4 },
        ];
        
        const domainSkills: Skill[] = [
          { id: "s13", name: "E-commerce", category: "domain", level: 3 },
          { id: "s14", name: "Healthcare", category: "domain", level: 2 },
          { id: "s15", name: "Finance", category: "domain", level: 4 },
        ];
        
        const allSkillsList = [...technicalSkills, ...softSkills, ...domainSkills];
        setAllSkills(allSkillsList);
        
        const mockContacts: ContactWithSkills[] = [
          {
            id: "1",
            user_id: "user1",
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+1234567890",
            company: "Acme Inc.",
            role: "Frontend Developer",
            notes: "Skilled in React and TypeScript",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skills: [technicalSkills[0], technicalSkills[1], softSkills[2]],
            availability: 80
          },
          {
            id: "2",
            user_id: "user1",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "+1987654321",
            company: "Tech Solutions",
            role: "UX Designer",
            notes: "Expert in Figma and user research",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skills: [technicalSkills[5], softSkills[0], softSkills[2]],
            availability: 50
          },
          {
            id: "3",
            user_id: "user1",
            name: "Bob Johnson",
            email: "bob.johnson@example.com",
            phone: "+1122334455",
            company: "Data Corp",
            role: "Backend Developer",
            notes: "Python and Django specialist",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skills: [technicalSkills[3], technicalSkills[4], technicalSkills[6], softSkills[3]],
            availability: 30
          },
          {
            id: "4",
            user_id: "user1",
            name: "Alice Williams",
            email: "alice.w@example.com",
            phone: "+1555666777",
            company: "DevOps Solutions",
            role: "DevOps Engineer",
            notes: "AWS and Docker expert",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skills: [technicalSkills[7], technicalSkills[2], domainSkills[0]],
            availability: 90
          },
          {
            id: "5",
            user_id: "user1",
            name: "Charlie Brown",
            email: "charlie.b@example.com",
            phone: "+1777888999",
            company: "Finance Tech",
            role: "Project Manager",
            notes: "PMP certified, finance background",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skills: [softSkills[0], softSkills[1], domainSkills[2]],
            availability: 70
          }
        ];
        
        const mockTasks: Task[] = [
          {
            id: "t1",
            title: "Implement user authentication",
            description: "Create a secure authentication system with login, registration, and password reset",
            requiredSkills: [technicalSkills[1], technicalSkills[2]],
            assignedTo: null,
            estimatedHours: 20,
            priority: "high"
          },
          {
            id: "t2",
            title: "Design product landing page",
            description: "Create a visually appealing landing page for our new product",
            requiredSkills: [technicalSkills[5]],
            assignedTo: null,
            estimatedHours: 15,
            priority: "medium"
          },
          {
            id: "t3",
            title: "Setup CI/CD pipeline",
            description: "Configure automated testing and deployment workflow",
            requiredSkills: [technicalSkills[7]],
            assignedTo: null,
            estimatedHours: 10,
            priority: "low"
          },
          {
            id: "t4",
            title: "Database optimization",
            description: "Improve database queries and indexes for better performance",
            requiredSkills: [technicalSkills[6]],
            assignedTo: null,
            estimatedHours: 12,
            priority: "medium"
          },
          {
            id: "t5",
            title: "Payment integration",
            description: "Integrate Stripe payment gateway for e-commerce functionality",
            requiredSkills: [technicalSkills[2], domainSkills[0]],
            assignedTo: null,
            estimatedHours: 18,
            priority: "high"
          }
        ];
        
        setContacts(mockContacts);
        setFilteredContacts(mockContacts);
        setTasks(mockTasks);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load resource data",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  // Filter contacts based on search query and filters
  useEffect(() => {
    let filtered = [...contacts];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(query) ||
        contact.role?.toLowerCase().includes(query) ||
        contact.skills.some(skill => skill.name.toLowerCase().includes(query))
      );
    }
    
    // Apply skill filter
    if (skillFilter) {
      filtered = filtered.filter(contact =>
        contact.skills.some(skill => skill.id === skillFilter)
      );
    }
    
    // Apply availability filter
    if (availabilityFilter !== null) {
      filtered = filtered.filter(contact =>
        contact.availability >= availabilityFilter
      );
    }
    
    setFilteredContacts(filtered);
  }, [contacts, searchQuery, skillFilter, availabilityFilter]);
  
  // Auto-allocate resources to tasks
  const handleAutoAllocate = async () => {
    setIsAnalyzing(true);
    
    try {
      // In a real app, this would be an AI-driven allocation via API
      // For demo purposes, we'll create a simple algorithm to match skills
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedTasks = [...tasks];
      
      // Simple allocation algorithm: match by required skills and availability
      updatedTasks.forEach(task => {
        if (task.assignedTo === null) {
          // Find the best match based on skills and availability
          const matches = contacts.map(contact => {
            // Calculate skill match score (0-100%)
            const requiredSkillsCount = task.requiredSkills.length;
            const matchedSkillsCount = task.requiredSkills.filter(
              required => contact.skills.some(skill => skill.id === required.id)
            ).length;
            
            const skillMatchScore = requiredSkillsCount > 0
              ? (matchedSkillsCount / requiredSkillsCount) * 100
              : 0;
              
            // Factor in availability
            const availabilityScore = contact.availability;
            
            // Combined score weighted by importance (skills more important than availability)
            const totalScore = (skillMatchScore * 0.7) + (availabilityScore * 0.3);
            
            return {
              contactId: contact.id,
              skillMatchScore,
              availabilityScore,
              totalScore
            };
          });
          
          // Sort by total score (descending)
          matches.sort((a, b) => b.totalScore - a.totalScore);
          
          // Assign to the best match if above threshold
          if (matches.length > 0 && matches[0].totalScore > 50) {
            task.assignedTo = matches[0].contactId;
          }
        }
      });
      
      setTasks(updatedTasks);
      
      toast({
        title: "Resource allocation complete",
        description: `${updatedTasks.filter(t => t.assignedTo !== null).length} of ${updatedTasks.length} tasks have been assigned`
      });
      
      setBotResponse(`
I've analyzed your team's skills and task requirements and made the following recommendations:

1. Resource allocation complete! ${updatedTasks.filter(t => t.assignedTo !== null).length} of ${updatedTasks.length} tasks have been assigned.

2. Key allocations:
   - User authentication task assigned to ${contacts.find(c => c.id === updatedTasks.find(t => t.title.includes("authentication"))?.assignedTo)?.name || 'No match'} based on TypeScript and Node.js expertise.
   - Product landing page design assigned to ${contacts.find(c => c.id === updatedTasks.find(t => t.title.includes("landing page"))?.assignedTo)?.name || 'No match'} due to UI Design skills.
   - CI/CD pipeline setup assigned to ${contacts.find(c => c.id === updatedTasks.find(t => t.title.includes("CI/CD"))?.assignedTo)?.name || 'No match'} who has DevOps experience.

3. Skill gaps identified:
   - Consider hiring or training for additional expertise in payment processing systems.
   - Your team would benefit from more database optimization specialists.

4. Workload balance:
   - Jane Smith is currently allocated at only 50% capacity - consider assigning more tasks.
   - Bob Johnson is approaching capacity at 70% allocation - monitor workload carefully.

Let me know if you'd like more detailed analysis or have specific questions about the allocation.
      `);
    } catch (error) {
      console.error('Error auto-allocating resources:', error);
      toast({
        title: "Allocation failed",
        description: "Could not allocate resources to tasks",
        variant: "destructive"
      });
      setBotResponse(null);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle custom analysis request
  const handleCustomAnalysis = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for the resource bot",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // In a real app, this would be an AI response via API
      // For demo purposes, we'll generate canned responses based on keywords
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let response = "";
      
      if (customPrompt.toLowerCase().includes("skill") && customPrompt.toLowerCase().includes("gap")) {
        response = `
Based on my analysis of your team's skills and project requirements, I've identified the following skill gaps:

1. DevOps expertise: Only one team member has DevOps skills, and they're at a moderate proficiency level. Consider training additional team members or hiring a dedicated DevOps specialist.

2. Database optimization: Your database expertise is concentrated in a single team member who is only 30% available. This creates a bottleneck for database-related tasks.

3. Domain knowledge: Your team has limited experience in the healthcare domain, which may impact upcoming healthcare-related projects.

4. Leadership capacity: Only one team member has strong leadership skills. Consider leadership training for other senior team members.

Recommendations:
- Prioritize hiring for DevOps and database skills
- Implement cross-training for critical skills to reduce single points of failure
- Consider bringing in contractors with healthcare domain expertise for upcoming projects
`;
      } else if (customPrompt.toLowerCase().includes("allocate") || customPrompt.toLowerCase().includes("assign")) {
        response = `
I've analyzed the current team composition and task requirements, and recommend the following allocations:

1. User Authentication (High Priority):
   → Assign to John Doe (80% available)
   → Strong TypeScript skills make him ideal for this security-critical feature

2. Product Landing Page (Medium Priority):
   → Assign to Jane Smith (50% available)
   → Her UI Design expertise aligns perfectly with this creative task

3. CI/CD Pipeline (Low Priority):
   → Assign to Alice Williams (90% available)
   → She has the necessary DevOps skills and high availability

4. Database Optimization (Medium Priority):
   → Assign to Bob Johnson (30% available)
   → Despite low availability, he's the only team member with database expertise

5. Payment Integration (High Priority):
   → Split between John Doe (frontend) and Alice Williams (backend/DevOps)
   → This approach leverages their complementary skills

This allocation optimizes for skill match while balancing workload across the team.
`;
      } else if (customPrompt.toLowerCase().includes("team") && customPrompt.toLowerCase().includes("analysis")) {
        response = `
Team Capability Analysis:

1. Technical Strengths:
   - Frontend development (React, TypeScript)
   - UI/UX design
   - Python backend development
   
2. Technical Weaknesses:
   - Limited DevOps capacity (only one specialist)
   - Database expertise is concentrated in one person
   - No dedicated QA specialists identified

3. Soft Skills Distribution:
   - Strong teamwork culture (most team members rated high)
   - Good problem-solving capabilities
   - Communication skills are well distributed
   - Leadership capacity is limited to one individual

4. Domain Expertise:
   - Finance industry knowledge is present but limited
   - E-commerce experience exists but isn't widespread
   - Healthcare domain knowledge is minimal

5. Resource Utilization:
   - Overall team utilization: 64% (moderate)
   - Some members are underutilized (Alice at 90% availability)
   - Others are approaching capacity (Bob at only 30% availability)

Recommendations:
- Consider rebalancing workloads from Bob to Alice
- Invest in cross-training for critical skills
- Develop leadership capabilities in more team members
`;
      } else {
        response = `
I've analyzed your request about "${customPrompt}" and examined your team's skills and project requirements.

Key insights:

1. Team Composition:
   - 5 team members with diverse skill sets
   - Technical skills are primarily concentrated in frontend development and design
   - Most team members have good collaboration skills

2. Project Requirements:
   - Current tasks require a mix of frontend, backend, and DevOps skills
   - High-priority items like authentication and payment integration need immediate attention

3. Resource Availability:
   - Overall team capacity is at 64%
   - Some specialists have limited availability (Bob Johnson at 30%)
   - Others have significant bandwidth (Alice Williams at 90%)

4. Recommendations:
   - Prioritize high-impact tasks that align with available skills
   - Consider cross-training to address skill gaps
   - Monitor workload for Bob Johnson who has unique skills but limited availability
   - Take advantage of Alice Williams' availability for new initiatives

Please let me know if you'd like me to elaborate on any aspect of this analysis or if you have specific questions about resource allocation.
`;
      }
      
      setBotResponse(response);
      
      toast({
        title: "Analysis complete",
        description: "Resource Bot has analyzed your request"
      });
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze your request",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle assigning a task manually
  const handleAssignTask = (taskId: string, contactId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, assignedTo: contactId } : task
    ));
    
    toast({
      title: "Task assigned",
      description: `Task assigned to ${contacts.find(c => c.id === contactId)?.name}`
    });
  };
  
  // Handle skill level display
  const renderSkillLevel = (level: number) => {
    return (
      <div className="flex space-x-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 w-1.5 rounded-full ${i < level ? 'bg-primary' : 'bg-muted'}`}
          ></div>
        ))}
      </div>
    );
  };
  
  // Reset all task assignments
  const handleResetAssignments = () => {
    setTasks(tasks.map(task => ({ ...task, assignedTo: null })));
    
    toast({
      title: "Assignments reset",
      description: "All task assignments have been cleared"
    });
    
    setBotResponse(null);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resource Bot</h1>
          <p className="text-muted-foreground">
            AI-powered resource allocation and skills analysis
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Team and Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Tasks
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="team" className="mt-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search team members, skills, or roles..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={skillFilter || ""} onValueChange={(value) => setSkillFilter(value || null)}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Skills</SelectItem>
                    {allSkills.map(skill => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={availabilityFilter?.toString() || ""} 
                  onValueChange={(value) => setAvailabilityFilter(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Availability</SelectItem>
                    <SelectItem value="25">At least 25%</SelectItem>
                    <SelectItem value="50">At least 50%</SelectItem>
                    <SelectItem value="75">At least 75%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredContacts.map(contact => (
                    <Card 
                      key={contact.id} 
                      className={`hover:shadow-md transition-shadow ${selectedContact === contact.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedContact(contact.id === selectedContact ? null : contact.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-72">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium text-lg">{contact.name}</h3>
                                <p className="text-muted-foreground text-sm">{contact.role}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {contact.skills.map(skill => (
                                <div key={skill.id} className="flex items-center space-x-1">
                                  <Badge variant="outline" className="flex items-center space-x-1">
                                    <span>{skill.name}</span>
                                    {renderSkillLevel(skill.level)}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Availability: </span>
                                <span className={`font-medium ${contact.availability >= 75 ? 'text-green-600' : contact.availability >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                  {contact.availability}%
                                </span>
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`mt-2 ${selectedContact === contact.id ? 'bg-primary text-primary-foreground' : ''}`}
                              >
                                {selectedContact === contact.id ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                
                {!isLoading && filteredContacts.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No team members found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                tasks.map(task => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{task.title}</CardTitle>
                          <CardDescription>
                            Estimated: {task.estimatedHours} hours | Priority: {task.priority}
                          </CardDescription>
                        </div>
                        <Badge variant={
                          task.priority === 'high' ? 'destructive' : 
                          task.priority === 'medium' ? 'default' : 
                          'outline'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="text-sm mr-2 text-muted-foreground">Required skills:</div>
                        {task.requiredSkills.map(skill => (
                          <Badge key={skill.id} variant="secondary">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Assignment</div>
                        {task.assignedTo ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {contacts.find(c => c.id === task.assignedTo)?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {contacts.find(c => c.id === task.assignedTo)?.role}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAssignTask(task.id, '')}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Select onValueChange={(value) => handleAssignTask(task.id, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to team member" />
                            </SelectTrigger>
                            <SelectContent>
                              {contacts.map(contact => (
                                <SelectItem key={contact.id} value={contact.id}>
                                  {contact.name} ({contact.availability}% available)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              <div className="flex justify-center mt-4 space-x-4">
                <Button variant="outline" onClick={handleResetAssignments}>
                  Reset All Assignments
                </Button>
                <Button onClick={handleAutoAllocate} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Auto-Allocate Resources
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column - AI Bot */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Resource Bot</CardTitle>
                  <CardDescription>AI-powered resource analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {botResponse ? (
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Analysis Results</h3>
                  </div>
                  <div className="text-sm whitespace-pre-line">{botResponse}</div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Resource Bot</h3>
                  <p className="text-muted-foreground mb-4">
                    Ask for resource allocation advice or team analysis
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Ask Resource Bot for advice (e.g., 'Analyze team skills', 'Help allocate resources', 'Identify skill gaps')"
                  className="min-h-24"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isAnalyzing}
                />
                <Button 
                  className="w-full" 
                  onClick={handleCustomAnalysis}
                  disabled={isAnalyzing || !customPrompt.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Suggested Prompts</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start text-left" 
                    onClick={() => setCustomPrompt("Identify skill gaps in our team")}
                  >
                    <Cpu className="h-4 w-4 mr-2" />
                    Identify skill gaps in our team
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start text-left" 
                    onClick={() => setCustomPrompt("Recommend optimal task allocations")}
                  >
                    <Cpu className="h-4 w-4 mr-2" />
                    Recommend optimal task allocations
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start text-left" 
                    onClick={() => setCustomPrompt("Provide comprehensive team analysis")}
                  >
                    <Cpu className="h-4 w-4 mr-2" />
                    Provide comprehensive team analysis
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setBotResponse(null)}
                disabled={!botResponse}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Results
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleAutoAllocate}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Auto-Allocate Tasks
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
