import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DiscussionPost, DiscussionComment } from '@/types/discussion.types';
import { DiscussionService } from '@/utils/discussionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
  PenSquare,
  Search,
  Filter as FilterIcon,
  X
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const availableTags = ['Question', 'Discussion', 'Announcement', 'Help', 'Project', 'Bug', 'Feature'];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('discussion_posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (postsError) {
        throw postsError;
      }
      
      setPosts(postsData || []);
      
      const commentsMap: Record<string, DiscussionComment[]> = {};
      
      if (postsData && postsData.length > 0) {
        await Promise.all(
          postsData.map(async (post) => {
            const { data: commentsData, error: commentsError } = await supabase
              .from('discussion_comments')
              .select('*')
              .eq('post_id', post.id)
              .order('created_at', { ascending: true });
              
            if (!commentsError && commentsData && commentsData.length > 0) {
              commentsMap[post.id] = commentsData;
            }
          })
        );
      }
      
      setComments(commentsMap);
    } catch (error) {
      console.error('Error loading discussion data:', error);
      toast({
        title: "Failed to load discussions",
        description: "There was an error loading the discussion data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Post title and content cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a post",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: newPost, error } = await supabase
        .from('discussion_posts')
        .insert({
          user_id: user.id,
          title: newPostTitle,
          content: newPostContent,
          upvotes: 0,
          downvotes: 0,
          tags: selectedTags
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Post Created",
        description: "Your post has been created successfully",
      });
      
      setPosts([newPost, ...posts]);
      setSelectedTags([]);
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePostForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Failed to Create Post",
        description: "There was an error creating your post",
        variant: "destructive"
      });
    }
  };

  const handleCreateComment = async (postId: string) => {
    const content = newCommentContent[postId];
    
    if (!content || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to comment",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: newComment, error } = await supabase
        .from('discussion_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content,
          upvotes: 0,
          downvotes: 0,
          parent_id: null
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully",
      });
      
      setComments({
        ...comments,
        [postId]: [...(comments[postId] || []), newComment]
      });
      
      setNewCommentContent({
        ...newCommentContent,
        [postId]: ''
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Failed to Add Comment",
        description: "There was an error adding your comment",
        variant: "destructive"
      });
    }
  };

  const handleVote = async (
    type: 'post' | 'comment',
    id: string,
    voteType: 'upvote' | 'downvote'
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to vote",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (type === 'post') {
        const post = posts.find(p => p.id === id);
        if (!post) return;
        
        const updatedPost = {
          ...post,
          upvotes: voteType === 'upvote' ? post.upvotes + 1 : post.upvotes,
          downvotes: voteType === 'downvote' ? post.downvotes + 1 : post.downvotes
        };
        
        const { error } = await supabase
          .from('discussion_posts')
          .update({
            upvotes: updatedPost.upvotes,
            downvotes: updatedPost.downvotes
          })
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        const updatedPosts = posts.map(p => p.id === id ? updatedPost : p);
        setPosts(updatedPosts);
      } else {
        let commentFound = false;
        const updatedComments = { ...comments };
        
        for (const postId in updatedComments) {
          updatedComments[postId] = updatedComments[postId].map(comment => {
            if (comment.id === id) {
              commentFound = true;
              return {
                ...comment,
                upvotes: voteType === 'upvote' ? comment.upvotes + 1 : comment.upvotes,
                downvotes: voteType === 'downvote' ? comment.downvotes + 1 : comment.downvotes
              };
            }
            return comment;
          });
        }
        
        if (commentFound) {
          for (const postId in updatedComments) {
            const updatedComment = updatedComments[postId].find(c => c.id === id);
            if (updatedComment) {
              const { error } = await supabase
                .from('discussion_comments')
                .update({
                  upvotes: updatedComment.upvotes,
                  downvotes: updatedComment.downvotes
                })
                .eq('id', id);
                
              if (error) {
                throw error;
              }
              
              setComments(updatedComments);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      toast({
        title: "Failed to Vote",
        description: "There was an error registering your vote",
        variant: "destructive"
      });
    }
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

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        const { data, error } = await supabase
          .from('discussion_posts')
          .select('*')
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setPosts(data || []);
      } catch (error) {
        console.error('Error searching posts:', error);
      }
    } else {
      loadPosts();
    }
  };

  const handleFilterByTags = async (tags: string[]) => {
    setSelectedTags(tags);
    
    if (tags.length > 0) {
      try {
        const { data, error } = await supabase
          .from('discussion_posts')
          .select('*')
          .contains('tags', tags)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setPosts(data || []);
      } catch (error) {
        console.error('Error filtering posts by tags:', error);
      }
    } else {
      loadPosts();
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery 
      ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesTags = selectedTags.length > 0
      ? selectedTags.some(tag => post.tags.includes(tag))
      : true;
    
    return matchesSearch && matchesTags;
  });
  
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

  function renderPosts(posts: DiscussionPost[]) {
    if (posts.length === 0) {
      return (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
          <p className="text-muted-foreground">Be the first to start a discussion!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>
                    Posted by {post.user_id} · {new Date(post.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm" onClick={() => handleVote('post', post.id, 'upvote')}>
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                  <span className="font-bold">{post.upvotes - post.downvotes}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleVote('post', post.id, 'downvote')}>
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{post.content}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <div 
                    key={tag} 
                    className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments[post.id]?.length || 0} Comments</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Bookmark className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Flag className="h-4 w-4" />
                  Report
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex flex-col space-y-4">
              <div className="w-full">
                <h4 className="text-sm font-medium mb-2">Comments</h4>
                <div className="space-y-4">
                  {(comments[post.id] || []).map(comment => (
                    <div key={comment.id} className="flex gap-2 group">
                      <div className="flex flex-col items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleVote('comment', comment.id, 'upvote')}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium">{comment.upvotes - comment.downvotes}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleVote('comment', comment.id, 'downvote')}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex-1 bg-muted/50 rounded-md p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comment.user_id}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Reply</Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Share</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="w-full flex gap-2">
                <Textarea 
                  placeholder="Write a comment..." 
                  className="min-h-20"
                  value={newCommentContent[post.id] || ''}
                  onChange={(e) => setNewCommentContent({
                    ...newCommentContent,
                    [post.id]: e.target.value
                  })}
                />
                <Button 
                  onClick={() => handleCreateComment(post.id)} 
                  className="self-end"
                  disabled={!newCommentContent[post.id]?.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Discussions</h1>
          <p className="text-muted-foreground">
            Join the conversation and share your thoughts with the community
          </p>
        </div>
      </div>

      {showCreatePostForm && (
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Create a Post</CardTitle>
              <CardDescription>Share something interesting with the community</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowCreatePostForm(false)}
              className="rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
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
      )}

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-3/4">
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
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <FilterIcon className="h-4 w-4" />
                Filters
              </Button>
            </div>
            
            <div className="mb-6 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
  
              {showAdvancedFilters && (
                <Card className="mt-4 p-4 animate-fade-in">
                  <h3 className="font-medium mb-2">Filter by tags</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {availableTags.map(tag => (
                      <Button 
                        key={tag} 
                        variant={selectedTags.includes(tag) ? "default" : "outline"} 
                        size="sm"
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
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedTags([])}
                    >
                      Clear filters
                    </Button>
                  </div>
                </Card>
              )}
            </div>
  
            <TabsContent value="hot" className="space-y-4">
              {renderPosts(sortedPosts)}
            </TabsContent>
            <TabsContent value="new" className="space-y-4">
              {renderPosts(sortedPosts)}
            </TabsContent>
            <TabsContent value="top" className="space-y-4">
              {renderPosts(sortedPosts)}
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-1/4 sticky top-4">
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Discussion Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts:</span>
                  <span className="font-medium">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Comments:</span>
                  <span className="font-medium">
                    {Object.values(comments).reduce((total, commentArray) => total + commentArray.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users:</span>
                  <span className="font-medium">
                    {new Set([...posts.map(p => p.user_id), 
                      ...Object.values(comments).flat().map(c => c.user_id)]).size}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(posts.flatMap(p => p.tags)))
                  .slice(0, 8)
                  .map(tag => (
                    <Button 
                      key={tag} 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (!selectedTags.includes(tag)) {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className={`fixed bottom-8 right-8 transition-all duration-300 ${showFloatingButton ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
        <div className="relative group">
          <Button 
            size="lg" 
            className="rounded-full w-16 h-16 shadow-lg group-hover:scale-110 transition-transform duration-200"
            onClick={() => setShowCreatePostForm(true)}
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
};

export default Discussions;
