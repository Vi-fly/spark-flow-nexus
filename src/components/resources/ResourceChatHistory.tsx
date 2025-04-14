
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Folder,
  Loader2,
  RotateCcw,
  Save,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ChatEntry = {
  id: string;
  taskName: string; 
  userMessage: string;
  botResponse: string;
  timestamp: string;
};

export function ResourceChatHistory() {
  const [activeTab, setActiveTab] = useState("chatbot");
  const [savedChats, setSavedChats] = useState<ChatEntry[]>([]);
  const [expandedChats, setExpandedChats] = useState<string[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Load saved chats from localStorage
  useEffect(() => {
    const loadSavedChats = () => {
      try {
        const savedData = localStorage.getItem('resourceChatHistory');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const formattedChats = parsedData.map((chat: any, index: number) => ({
            id: `chat-${index}`,
            taskName: chat.user.substring(0, 30) + (chat.user.length > 30 ? "..." : ""),
            userMessage: chat.user,
            botResponse: chat.bot,
            timestamp: new Date().toISOString(),
          }));
          setSavedChats(formattedChats);
        }
      } catch (error) {
        console.error("Error loading saved chats:", error);
      }
    };

    loadSavedChats();
  }, []);

  // Filter saved chats by search term
  const filteredChats = searchTerm
    ? savedChats.filter(
        chat =>
          chat.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.userMessage.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : savedChats;

  const toggleChatExpanded = (chatId: string) => {
    setExpandedChats(prev =>
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleSelectChat = (chat: ChatEntry) => {
    setSelectedChat(chat);
  };

  const handleDeleteChat = (chatId: string) => {
    setSavedChats(prev => prev.filter(chat => chat.id !== chatId));
    
    // Update localStorage
    const updatedChats = savedChats.filter(chat => chat.id !== chatId);
    localStorage.setItem('resourceChatHistory', JSON.stringify(
      updatedChats.map(chat => ({
        user: chat.userMessage,
        bot: chat.botResponse
      }))
    ));
    
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
    
    toast({
      title: "Chat deleted",
      description: "The saved chat has been removed from history",
    });
  };

  const clearAllChats = () => {
    setSavedChats([]);
    setSelectedChat(null);
    localStorage.removeItem('resourceChatHistory');
    
    toast({
      title: "History cleared",
      description: "All saved chats have been removed",
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Resource Manager & Chat History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chatbot" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
            <TabsTrigger value="history">Chat History</TabsTrigger>
          </TabsList>

          <TabsContent value="chatbot" className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Ask the AI assistant to help with resource allocation and management.
              Your conversations will be saved in the Chat History tab.
            </p>
            
            <div className="space-y-4">
              <p className="text-sm font-medium">Your most recent chats:</p>
              
              {savedChats.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {savedChats.slice(0, 3).map((chat) => (
                      <div
                        key={chat.id}
                        className="border rounded-md p-3 text-sm"
                      >
                        <div className="font-medium mb-1">{chat.taskName}</div>
                        <div className="text-muted-foreground text-xs truncate">
                          {chat.botResponse.substring(0, 60)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="border rounded-md p-4 text-center text-muted-foreground">
                  No chat history yet. Start a conversation to save it.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search saved chats..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllChats}
                disabled={savedChats.length === 0}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-2">
                <h3 className="text-sm font-medium mb-2">Saved Suggestions</h3>
                
                <ScrollArea className="h-[400px]">
                  {filteredChats.length > 0 ? (
                    <div className="space-y-2">
                      {filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`border rounded-md p-3 text-sm cursor-pointer transition-colors ${
                            selectedChat?.id === chat.id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleSelectChat(chat)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{chat.taskName}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleChatExpanded(chat.id);
                              }}
                            >
                              {expandedChats.includes(chat.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          
                          <div className="flex items-center text-xs text-muted-foreground mb-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {new Date(chat.timestamp).toLocaleString()}
                            </span>
                          </div>
                          
                          {expandedChats.includes(chat.id) && (
                            <div className="mt-2 space-y-2">
                              <div>
                                <div className="text-xs font-medium">Request:</div>
                                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md mt-1">
                                  {chat.userMessage}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-medium">Response:</div>
                                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md mt-1 line-clamp-3">
                                  {chat.botResponse}
                                </div>
                              </div>
                              
                              <div className="flex justify-end">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChat(chat.id);
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Folder className="h-10 w-10 mx-auto opacity-20" />
                      <p className="mt-2">
                        {searchTerm
                          ? "No chats matching your search"
                          : "No saved chats yet"}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <div className="border rounded-md p-2">
                <h3 className="text-sm font-medium mb-2">Selected Suggestion</h3>
                
                {selectedChat ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium">Task:</p>
                      <Textarea
                        value={selectedChat.userMessage}
                        readOnly
                        className="mt-1 resize-none h-20 text-sm"
                      />
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium">Suggestion:</p>
                      <Textarea
                        value={selectedChat.botResponse}
                        readOnly
                        className="mt-1 resize-none h-40 text-sm"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedChat(null)}
                      >
                        Clear
                      </Button>
                      <Button size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <Search className="h-12 w-12 mx-auto opacity-20" />
                      <p className="mt-2">Select a suggestion to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
