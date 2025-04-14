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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserVotes {
  [key: string]: {
    type: 'post' | 'comment';
    vote: 'upvote' | 'downvote' | null;
  };
}

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
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<DiscussionPost | null>(null);
  const [editingComment, setEditingComment] = useState<DiscussionComment | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const availableTags = ['Question', 'Discussion', 'Announcement', 'Help', 'Project', 'Bug', 'Feature'];

  useEffect(() => {
    loadPosts();
    loadUserVotes();
  }, [user]);

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

  const loadUserVotes = async () => {
    if (!user) return;
    
    try {
      const savedVotes = localStorage.getItem(`user_votes_${user.id}`);
      if (savedVotes) {
        setUserVotes(JSON.parse(savedVotes));
      }
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const saveUserVotes = (newVotes: UserVotes) => {
    if (!user) return;
    
    try {
      localStorage.setItem(`user_votes_${user.id}`, JSON.stringify(newVotes));
    } catch (error) {
      console.error('Error saving user votes:', error);
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

  const handleUpdatePost = async () => {
    if (!editingPost || !user) return;
    
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Post title and content cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    if (editingPost.user_id !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only edit your own posts",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('discussion_posts')
        .update({
          title: newPostTitle,
          content: newPostContent,
          tags: selectedTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPost.id);
      
      if (error) {
        throw error;
      }
      
      const updatedPosts = posts.map(post => 
        post.id === editingPost.id 
          ? {
              ...post,
              title: newPostTitle,
              content: newPostContent,
              tags: selectedTags,
              updated_at: new Date().toISOString()
            }
          : post
      );
      
      setPosts(updatedPosts);
      
      toast({
        title: "Post Updated",
        description: "Your post has been updated successfully",
      });
      
      setSelectedTags([]);
      setNewPostTitle('');
      setNewPostContent('');
      setEditingPost(null);
      setShowCreatePostForm(false);
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Failed to Update Post",
        description: "There was an error updating your post",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async () => {
    if (!deletePostId || !user) return;
    
    const postToDelete = posts.find(p => p.id === deletePostId);
    if (!postToDelete) {
      setDeletePostId(null);
      return;
    }
    
    if (postToDelete.user_id !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only delete your own posts",
        variant: "destructive"
      });
      setDeletePostId(null);
      return;
    }
    
    try {
      if (comments[deletePostId]) {
        const { error: commentsError } = await supabase
          .from('discussion_comments')
          .delete()
          .eq('post_id', deletePostId);
          
        if (commentsError) {
          throw commentsError;
        }
      }
      
      const { error } = await supabase
        .from('discussion_posts')
        .delete()
        .eq('id', deletePostId);
      
      if (error) {
        throw error;
      }
      
      setPosts(posts.filter(p => p.id !== deletePostId));
      
      const newComments = { ...comments };
      delete newComments[deletePostId];
      setComments(newComments);
      
      toast({
        title: "Post Deleted",
        description: "Your post has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Failed to Delete Post",
        description: "There was an error deleting your post",
        variant: "destructive"
      });
    } finally {
      setDeletePostId(null);
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

  const handleUpdateComment = async () => {
    if (!editingComment || !user) return;
    
    if (!editCommentContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    if (editingComment.user_id !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only edit your own comments",
        variant: "destructive"
      });
      setEditingComment(null);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('discussion_comments')
        .update({
          content: editCommentContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingComment.id);
      
      if (error) {
        throw error;
      }
      
      const updatedComments = { ...comments };
      updatedComments[editingComment.post_id] = updatedComments[editingComment.post_id].map(comment => 
        comment.id === editingComment.id 
          ? {
              ...comment,
              content: editCommentContent,
              updated_at: new Date().toISOString()
            }
          : comment
      );
      
      setComments(updatedComments);
      
      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully",
      });
      
      setEditingComment(null);
      setEditCommentContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Failed to Update Comment",
        description: "There was an error updating your comment",
        variant: "destructive"
      });
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId || !user) return;
    
    let commentToDelete: DiscussionComment | null = null;
    let postId: string | null = null;
    
    for (const [pId, commentArray] of Object.entries(comments)) {
      const comment = commentArray.find(c => c.id === deleteCommentId);
      if (comment) {
        commentToDelete = comment;
        postId = pId;
        break;
      }
    }
    
    if (!commentToDelete || !postId) {
      setDeleteCommentId(null);
      return;
    }
    
    if (commentToDelete.user_id !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only delete your own comments",
        variant: "destructive"
      });
      setDeleteCommentId(null);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('discussion_comments')
        .delete()
        .eq('id', deleteCommentId);
      
      if (error) {
        throw error;
      }
      
      const updatedComments = { ...comments };
      updatedComments[postId] = updatedComments[postId].filter(c => c.id !== deleteCommentId);
      setComments(updatedComments);
      
      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Failed to Delete Comment",
        description: "There was an error deleting your comment",
        variant: "destructive"
      });
    } finally {
      setDeleteCommentId(null);
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
    
    const existingVote = userVotes[id];
    
    if (existingVote && existingVote.vote === voteType) {
      toast({
        title: "Already Voted",
        description: `You have already ${voteType}d this ${type}`,
      });
      return;
    }
    
    try {
      if (type === 'post') {
        const post = posts.find(p => p.id === id);
        if (!post) return;
        
        let updatedUpvotes = post.upvotes;
        let updatedDownvotes = post.downvotes;
        
        if (existingVote && existingVote.vote) {
          if (existingVote.vote === 'upvote') {
            updatedUpvotes = Math.max(0, updatedUpvotes - 1);
          } else if (existingVote.vote === 'downvote') {
            updatedDownvotes = Math.max(0, updatedDownvotes - 1);
          }
        }
        
        if (voteType === 'upvote') {
          updatedUpvotes++;
        } else {
          updatedDownvotes++;
        }
        
        const { error } = await supabase
          .from('discussion_posts')
          .update({
            upvotes: updatedUpvotes,
            downvotes: updatedDownvotes
          })
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        const updatedPosts = posts.map(p => p.id === id ? {
          ...p,
          upvotes: updatedUpvotes,
          downvotes: updatedDownvotes
        } : p);
        
        setPosts(updatedPosts);
        
        const newUserVotes = {
          ...userVotes,
          [id]: { type: 'post', vote: voteType }
        };
        setUserVotes(newUserVotes);
        saveUserVotes(newUserVotes);
      } else {
        let commentFound = false;
        const updatedComments = { ...comments };
        
        for (const postId in updatedComments) {
          const commentIndex = updatedComments[postId].findIndex(c => c.id === id);
          
          if (commentIndex !== -1) {
            const comment = updatedComments[postId][commentIndex];
            commentFound = true;
            
            let updatedUpvotes = comment.upvotes;
            let updatedDownvotes = comment.downvotes;
            
            if (existingVote && existingVote.vote) {
              if (existingVote.vote === 'upvote') {
                updatedUpvotes = Math.max(0, updatedUpvotes - 1);
              } else if (existingVote.vote === 'downvote') {
                updatedDownvotes = Math.max(0, updatedDownvotes - 1);
              }
            }
            
            if (voteType === 'upvote') {
              updatedUpvotes++;
            } else {
              updatedDownvotes++;
            }
            
            const { error } = await supabase
              .from('discussion_comments')
              .update({
                upvotes: updatedUpvotes,
                downvotes: updatedDownvotes
              })
              .eq('id', id);
              
            if (error) {
              throw error;
            }
            
            updatedComments[postId][commentIndex] = {
              ...comment,
              upvotes: updatedUpvotes,
              downvotes: updatedDownvotes
            };
            
            const newUserVotes = {
              ...userVotes,
              [id]: { type: 'comment', vote: voteType }
            };
            setUserVotes(newUserVotes);
            saveUserVotes(newUserVotes);
            
            break;
          }
        }
        
        if (commentFound) {
          setComments(updatedComments);
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

  const editPost = (post: DiscussionPost) => {
    if (!user || post.user_id !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only edit your own posts",
        variant: "destructive"
      });
      return;
    }
    
    setEditingPost(post);
    setNewPostTitle(post.title);
    setNewPostContent(post.content);
    setSelectedTags(post.tags || []);
    setShowCreatePostForm(true);
  };

  const editComment = (comment: DiscussionComment) => {
    if (!user || comment.user_id !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only edit your own comments",
        variant: "destructive"
      });
      return;
    }
    
    setEditingComment(comment);
    setEditCommentContent(comment.content);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery 
      ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesTags = selectedTags.length > 0
      ? selectedTags.some(tag => post.tags && post.tags.includes(tag))
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleVote('post', post.id, 'upvote')}
                    disabled={userVotes[post.id]?.vote === 'upvote'}
                    className={userVotes[post.id]?.vote === 'upvote' ? 'text-primary' : ''}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                  <span className="font-bold">{post.upvotes - post.downvotes}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleVote('post', post.id, 'downvote')}
                    disabled={userVotes[post.id]?.vote === 'downvote'}
                    className={userVotes[post.id]?.vote === 'downvote' ? 'text-destructive' : ''}
                  >
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{post.content}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags && post.tags.map(tag => (
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
                {user && post.user_id === user.id && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      onClick={() => editPost(post)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1 text-red-600 hover:text-red-800"
                      onClick={() => setDeletePostId(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </>
                )}
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
                          className={`h-6 w-6 p-0 ${userVotes[comment.id]?.vote === 'upvote' ? 'text-primary' : ''}`}
                          onClick={() => handleVote('comment', comment.id, 'upvote')}
                          disabled={userVotes[comment.id]?.vote === 'upvote'}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium">{comment.upvotes - comment.downvotes}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-6 w-6 p-0 ${userVotes[comment.id]?.vote === 'downvote' ? 'text-destructive' : ''}`}
                          onClick={() => handleVote('comment', comment.id, 'downvote')}
                          disabled={userVotes[comment.id]?.vote === 'downvote'}
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
                          {user && comment.user_id === user.id && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800"
                                onClick={() => editComment(comment)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-xs text-red-600 hover:text-red-800"
                                onClick={() => setDeleteCommentId(comment.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
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
    <>
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
      
      <AlertDialog open={deletePostId !== null} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone and all comments will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={deleteCommentId !== null} onOpenChange={(open) => !open && setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={editingComment !== null} onOpenChange={(open) => !open && setEditingComment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
            <DialogDescription>
              Make changes to your comment below.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="Edit your comment..." 
            className="min-h-32"
            value={editCommentContent}
            onChange={(e) => setEditCommentContent(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingComment(null)}>Cancel</Button>
            <Button onClick={handleUpdateComment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Discussions;
