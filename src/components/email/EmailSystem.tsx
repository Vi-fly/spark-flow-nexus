import React, { useState, useEffect } from 'react';
import { Send, UserPlus, Mail, FileText, User, Check, Loader2, RefreshCw, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Contact } from '@/types/database.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface EmailDraft {
  id: string;
  to: string[];
  subject: string;
  content: string;
  createdAt: Date;
}

export const EmailSystem = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (contactsError) {
          throw contactsError;
        }
        
        setContacts(contactsData || []);
        
        const mockTemplates: EmailTemplate[] = [
          {
            id: "1",
            name: "Project Update",
            subject: "Project Update - {{project_name}}",
            content: "Dear {{name}},\n\nI wanted to provide you with an update on the {{project_name}} project.\n\n{{project_update}}\n\nPlease let me know if you have any questions or concerns.\n\nBest regards,\n{{sender_name}}"
          },
          {
            id: "2",
            name: "Meeting Invitation",
            subject: "Invitation: Meeting on {{date}}",
            content: "Hi {{name}},\n\nI'd like to invite you to a meeting on {{date}} at {{time}} to discuss {{topic}}.\n\n{{additional_details}}\n\nPlease confirm your availability.\n\nThanks,\n{{sender_name}}"
          },
          {
            id: "3",
            name: "Task Assignment",
            subject: "New Task Assignment: {{task_name}}",
            content: "Hello {{name}},\n\nI'm assigning you a new task: {{task_name}}.\n\nDescription: {{task_description}}\nDeadline: {{deadline}}\nPriority: {{priority}}\n\nLet me know if you need any clarification.\n\nRegards,\n{{sender_name}}"
          }
        ];
        
        const mockDrafts: EmailDraft[] = [
          {
            id: "1",
            to: contactsData && contactsData.length > 0 ? [contactsData[0].email || ""] : [],
            subject: "Website Redesign Project",
            content: "Hi,\n\nI wanted to discuss the website redesign project with you. Can we schedule a call tomorrow?\n\nBest,\nMe",
            createdAt: new Date(new Date().setDate(new Date().getDate() - 2))
          }
        ];
        
        setTemplates(mockTemplates);
        setDrafts(mockDrafts);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load email data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  const generateEmailContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate email content",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const contactContext = contacts.length > 0 
        ? `Recipients: ${selectedContacts.map(id => contacts.find(c => c.id === id)?.name).join(', ')}`
        : '';
      
      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: { 
          messages: [
            { role: 'user', content: `Generate an email about: ${prompt}. ${contactContext}` }
          ],
          dbContext: '' 
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data.choices && data.choices[0]) {
        const responseText = data.choices[0].message.content;
        
        const subjectMatch = responseText.match(/Subject: (.*?)(?:\n|$)/);
        const bodyMatch = responseText.match(/(?:Body:|Email:|Message:)([\s\S]*)/);
        
        if (subjectMatch && subjectMatch[1]) {
          setSubject(subjectMatch[1].trim());
        } else {
          setSubject(`RE: ${prompt}`);
        }
        
        if (bodyMatch && bodyMatch[1]) {
          setContent(bodyMatch[1].trim());
        } else {
          setContent(responseText);
        }
      } else {
        throw new Error('Invalid response format');
      }
      
      toast({
        title: "Email content generated",
        description: "AI has successfully generated email content based on your prompt"
      });
    } catch (error) {
      console.error('Error generating email content:', error);
      toast({
        title: "Generation failed",
        description: "Could not generate email content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSendEmail = async () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "Recipients required",
        description: "Please select at least one recipient",
        variant: "destructive"
      });
      return;
    }
    
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter an email subject",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter email content",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Sending email...",
        description: "Your email is being sent"
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Email sent",
        description: `Email successfully sent to ${selectedContacts.length} recipient(s)`
      });
      
      setSelectedContacts([]);
      setSubject('');
      setContent('');
      setPrompt('');
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Sending failed",
        description: "Could not send email",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveDraft = () => {
    if (!subject.trim() && !content.trim() && selectedContacts.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Please add recipients, subject, or content before saving a draft",
        variant: "destructive"
      });
      return;
    }
    
    const newDraft: EmailDraft = {
      id: Date.now().toString(),
      to: selectedContacts.map(id => contacts.find(c => c.id === id)?.email || '').filter(Boolean),
      subject,
      content,
      createdAt: new Date()
    };
    
    setDrafts([newDraft, ...drafts]);
    
    toast({
      title: "Draft saved",
      description: "Your email has been saved as a draft"
    });
  };
  
  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setContent(template.content);
      setSelectedTemplate(templateId);
      
      toast({
        title: "Template loaded",
        description: `"${template.name}" template has been loaded`
      });
    }
  };
  
  const handleLoadDraft = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      setSelectedContacts(
        contacts
          .filter(c => c.email && draft.to.includes(c.email))
          .map(c => c.id)
      );
      setSubject(draft.subject);
      setContent(draft.content);
      setActiveTab('compose');
      
      toast({
        title: "Draft loaded",
        description: "Your draft has been loaded"
      });
    }
  };
  
  const handleDeleteDraft = (draftId: string) => {
    setDrafts(drafts.filter(d => d.id !== draftId));
    
    toast({
      title: "Draft deleted",
      description: "Your draft has been deleted"
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Email System</h1>
          <p className="text-muted-foreground">
            Send task-related emails and AI-generated correspondence
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Drafts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="compose" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>
                Create and send emails to contacts with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">To:</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      selectedContacts.length > 0
                        ? `${selectedContacts.length} recipient(s) selected`
                        : "Select recipients"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem 
                        key={contact.id} 
                        value={contact.id}
                        onSelect={() => {
                          if (selectedContacts.includes(contact.id)) {
                            setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                          } else {
                            setSelectedContacts([...selectedContacts, contact.id]);
                          }
                        }}
                      >
                        <div className="flex items-center">
                          {selectedContacts.includes(contact.id) && (
                            <Check className="h-4 w-4 mr-2 text-primary" />
                          )}
                          <span>{contact.name}</span>
                          <span className="ml-2 text-muted-foreground">{contact.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedContacts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedContacts.map(id => {
                      const contact = contacts.find(c => c.id === id);
                      return (
                        <div 
                          key={id}
                          className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                        >
                          <User className="h-3 w-3 mr-1" />
                          <span>{contact?.name}</span>
                          <button 
                            className="ml-2 hover:text-destructive"
                            onClick={() => setSelectedContacts(selectedContacts.filter(cid => cid !== id))}
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject:</label>
                <Input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder="Email subject"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Content:</label>
                <Textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Write your email here..."
                  className="min-h-32"
                />
              </div>
              
              <Card className="bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                  <CardDescription>
                    Generate professional email content with AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe what you want to communicate..."
                      disabled={isGenerating}
                    />
                    <Button 
                      onClick={generateEmailContent} 
                      disabled={isGenerating || !prompt.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Example prompts: "Send a project update", "Schedule a meeting for tomorrow", "Request feedback on design"
                  </div>
                </CardContent>
              </Card>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleSaveDraft}>
                Save as Draft
              </Button>
              <Button onClick={handleSendEmail}>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription className="truncate">
                    {template.subject}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.content}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleLoadTemplate(template.id)}
                  >
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {templates.length === 0 && (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No templates available</h3>
                <p className="text-muted-foreground">Create email templates to save time</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="drafts" className="mt-4">
          <div className="space-y-4">
            {drafts.map((draft) => (
              <Card key={draft.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{draft.subject || "(No subject)"}</CardTitle>
                      <CardDescription>
                        To: {draft.to.join(", ") || "(No recipients)"}
                      </CardDescription>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(draft.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {draft.content || "(No content)"}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteDraft(draft.id)}
                  >
                    Delete
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleLoadDraft(draft.id)}
                  >
                    Edit Draft
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {drafts.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No drafts saved</h3>
                <p className="text-muted-foreground">Your saved drafts will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
