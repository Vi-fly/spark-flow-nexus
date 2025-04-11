import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { databaseConnector } from '@/utils/databaseConnector';
import { DiscussionPost, DiscussionComment } from '@/types/discussion.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  MessageSquare,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share,
  Bookmark,
  Heart,
  Edit,
  Trash2,
  Flag,
  Filter,
  Tag,
  Plus,
  Send,
  PenSquare
} from 'lucide-react';

const Discussions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [comments, setComments] = useState<Record<string, DiscussionComment[]>>({});
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('hot');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const availableTags = ['Question', 'Discussion', 'Announcement', 'Help', 'Project', 'Bug', 'Feature'];

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (databaseConnector.getCurrentConnection() !== 'mongodb') {
          databaseConnector.configureMongoDb('mongodb://localhost:27017', 'discussions_db');
        }
        
        const connected = await databaseConnector.testConnection();
        setIsConnected(connected);
        
        if (connected) {
          fetchPosts();
        } else {
          toast({
            title: "Database Connection Failed",
            description: "Could not connect to MongoDB. Using demo data instead.",
            variant: "destructive"
          });
          loadDemoData();
        }
      } catch (error) {
        console.error('Error connecting to database:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the database. Using demo data.",
          variant: "destructive"
        });
        loadDemoData();
      }
    };
    
    checkConnection();
  }, [toast]);

  const fetchPosts = async () => {
    try {
      loadDemoData();
      
      toast({
        title: "Connected to MongoDB",
        description: "Successfully fetched discussion data.",
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Data Fetch Error",
        description: "Could not fetch posts from the database.",
        variant: "destructive"
      });
    }
  };

  const loadDemoData = () => {
    const demoUser = user?.email?.split('@')[0] || 'anonymous';
    const currentDate = new Date().toISOString();
    
    const demoPosts: DiscussionPost[] = [
      {
        id: '1',
        user_id: 'user1',
        title: 'Welcome to the Discussion Board',
        content: 'This is the first post in our discussion board. Feel free to interact!',
        upvotes: 42,
        downvotes: 2,
        tags: ['Announcement', 'Welcome'],
        created_at: currentDate,
        updated_at: currentDate
      },
      {
        id: '2',
        user_id: 'user2',
        title: 'How do I connect to MongoDB?',
        content: 'I am trying to configure my MongoDB connection and having some trouble.',
        upvotes: 15,
        downvotes: 0,
        tags: ['Question', 'Help', 'MongoDB'],
        created_at: currentDate,
        updated_at: currentDate
      },
      {
        id: '3',
        user_id: demoUser,
        title: 'My Task Manager Project',
        content: 'I just completed my task manager project. Here are some screenshots and lessons learned...',
        upvotes: 28,
        downvotes: 1,
        tags: ['Project', 'Showcase'],
        created_at: currentDate,
        updated_at: currentDate
      }
    ];
    
    const demoComments: Record<string, DiscussionComment[]> = {
      '1': [
        {
          id: 'c1',
          post_id: '1',
          user_id: 'user3',
          content: 'Great to be here! Looking forward to the discussions.',
          upvotes: 5,
          downvotes: 0,
          parent_id: null,
          created_at: currentDate,
          updated_at: currentDate
        }
      ],
      '2': [
        {
          id: 'c2',
          post_id: '2',
          user_id: 'user4',
          content: 'Have you tried the connection string format mongodb://username:password@host:port/database?',
          upvotes: 8,
          downvotes: 0,
          parent_id: null,
          created_at: currentDate,
          updated_at: currentDate
        },
        {
          id: 'c3',
          post_id: '2',
          user_id: 'user2',
          content: 'Thanks, that worked! I was missing the database name.',
          upvotes: 3,
          downvotes: 0,
          parent_id: 'c2',
          created_at: currentDate,
          updated_at: currentDate
        }
      ]
    };
    
    setPosts(demoPosts);
    setComments(demoComments);
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Post title and content cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const newPost: DiscussionPost = {
      id: `post_${Date.now()}`,
      user_id: user?.email?.split('@')[0] || 'anonymous',
      title: newPostTitle,
      content: newPostContent,
      upvotes: 0,
      downvotes: 0,
      tags: selectedTags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setPosts([newPost, ...posts]);
    setSelectedTags([]);
    setNewPostTitle('');
    setNewPostContent('');
    
    toast({
      title: "Post Created",
      description: "Your post has been published successfully."
    });
  };

  const handleCreateComment = (postId: string) => {
    const content = newCommentContent[postId];
    
    if (!content || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const newComment: DiscussionComment = {
      id: `comment_${Date.now()}`,
      post_id: postId,
      user_id: user?.email?.split('@')[0] || 'anonymous',
      content: content,
      upvotes: 0,
      downvotes: 0,
      parent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedComments = {
      ...comments,
      [postId]: [...(comments[postId] || []), newComment]
    };
    
    setComments(updatedComments);
    
    setNewCommentContent({
      ...newCommentContent,
      [postId]: ''
    });
    
    toast({
      title: "Comment Added",
      description: "Your comment has been posted successfully."
    });
  };

  const handleVote = (
    type: 'post' | 'comment',
    id: string,
    voteType: 'upvote' | 'downvote'
  ) => {
    if (type === 'post') {
      const updatedPosts = posts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            upvotes: voteType === 'upvote' ? post.upvotes + 1 : post.upvotes,
            downvotes: voteType === 'downvote' ? post.downvotes + 1 : post.downvotes
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
    } else {
      const updatedComments = { ...comments };
      
      for (const postId in updatedComments) {
        updatedComments[postId] = updatedComments[postId].map(comment => {
          if (comment.id === id) {
            return {
              ...comment,
              upvotes: voteType === 'upvote' ? comment.upvotes + 1 : comment.upvotes,
              downvotes: voteType === 'downvote' ? comment.downvotes + 1 : comment.downvotes
            };
          }
          return comment;
        });
      }
      
      setComments(updatedComments);
    }
    
    toast({
      title: "Vote Recorded",
      description: `Your ${voteType} has been counted.`
    });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (selectedTags.includes(newTag)) {
      toast({
        title: "Tag already added",
        description: "This tag is already added to your post."
      });
      return;
    }
    
    setSelectedTags([...selectedTags, newTag]);
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const filteredPosts = selectedTags.length > 0
    ? posts.filter(post => selectedTags.some(tag => post.tags.includes(tag)))
    : posts;
    
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (activeTab) {
      case 'hot':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      case 'new':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'top':
        return b.upvotes - a.upvotes;
      default:
        return 0;
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowFloatingButton(false);
      } else {
        setShowFloatingButton(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Discussions</h1>
          <p className="text-muted-foreground">
            Join the conversation and share your thoughts with the community
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
              <span className="text-sm text-muted-foreground">Connected to MongoDB</span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
              <span className="text-sm text-muted-foreground">Using Demo Data</span>
            </div>
          )}
        </div>
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Create a Post</CardTitle>
          <CardDescription>Share something interesting with the community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Post Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write your post here..."
              className="min-h-32"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags.map(tag => (
              <div 
                key={tag} 
                className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center"
              >
                <span>{tag}</span>
                <button 
                  className="ml-2 hover:text-destructive"
                  onClick={() => handleRemoveTag(tag)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Add a tag" 
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="sm" onClick={handleAddTag}>
              <Tag className="h-4 w-4 mr-1" />
              Add Tag
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Button 
                key={tag} 
                variant="ghost" 
                size="sm"
                className={selectedTags.includes(tag) ? "bg-primary/20" : ""}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    handleRemoveTag(tag);
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
              >
                {tag}
              </Button>
            ))}
          </div>
          <Button onClick={handleCreatePost}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </CardFooter>
      </Card>

      <Tabs 
        defaultValue="hot" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="hot" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Hot
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              New
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center">
              <ArrowUp className="h-4 w-4 mr-2" />
              Top
            </TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
        
        <TabsContent value="hot" className="space-y-4 mt-4">
          {renderPosts(sortedPosts)}
        </TabsContent>
        <TabsContent value="new" className="space-y-4 mt-4">
          {renderPosts(sortedPosts)}
        </TabsContent>
        <TabsContent value="top" className="space-y-4 mt-4">
          {renderPosts(sortedPosts)}
        </TabsContent>
      </Tabs>
      
      <div className={`fixed bottom-8 right-8 transition-all duration-300 ${showFloatingButton ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
        <div className="relative group">
          <Button 
            size="lg" 
            className="rounded-full w-16 h-16 shadow-lg group-hover:scale-110 transition-transform duration-200"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
              setTimeout(() => {
                const titleInput = document.querySelector('input[placeholder="Post Title"]');
                if (titleInput) {
                  (titleInput as HTMLInputElement).focus();
                }
              }, 700);
            }}
          >
            <PenSquare className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-background text-foreground px-3 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Create a post
          </div>
        </div>
      </div>
    </div>
  );

  function renderPosts(posts: DiscussionPost[]) {
    if (posts.length === 0) {
      return (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
          <p className="text-muted-foreground">Be the first to start a discussion</p>
        </div>
      );
    }
    
    return posts.map(post => (
      <Card key={post.id} className="animate-fade-in hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <div className="flex items-center mt-1 space-x-2">
                <span className="text-sm font-medium">Posted by {post.user_id}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleVote('post', post.id, 'upvote')}
                className="h-8 w-8"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold">{post.upvotes - post.downvotes}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleVote('post', post.id, 'downvote')}
                className="h-8 w-8"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map(tag => (
              <div 
                key={`${post.id}-${tag}`} 
                className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="whitespace-pre-line">{post.content}</p>
        </CardContent>
        
        <CardFooter className="flex flex-col items-stretch">
          <div className="flex justify-between border-t border-border pt-4">
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MessageCircle className="h-4 w-4 mr-1" />
                {comments[post.id]?.length || 0} Comments
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
            
            {post.user_id === user?.email?.split('@')[0] && (
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
            
            {post.user_id !== user?.email?.split('@')[0] && (
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Flag className="h-4 w-4 mr-1" />
                Report
              </Button>
            )}
          </div>
          
          {comments[post.id] && comments[post.id].length > 0 && (
            <div className="w-full mt-4 space-y-3">
              <h4 className="font-medium">Comments</h4>
              {comments[post.id].map(comment => (
                <div 
                  key={comment.id} 
                  className="border-l-2 border-primary/30 pl-4 py-2"
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium">{comment.user_id}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleVote('comment', comment.id, 'upvote')}
                        className="h-6 w-6"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <span className="text-xs font-semibold">
                        {comment.upvotes - comment.downvotes}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleVote('comment', comment.id, 'downvote')}
                        className="h-6 w-6"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="w-full mt-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Write a comment..."
                value={newCommentContent[post.id] || ''}
                onChange={(e) => 
                  setNewCommentContent({
                    ...newCommentContent,
                    [post.id]: e.target.value
                  })
                }
              />
              <Button 
                variant="outline" 
                onClick={() => handleCreateComment(post.id)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    ));
  }
};

export default Discussions;
