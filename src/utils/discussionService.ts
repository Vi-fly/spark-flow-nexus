
import { supabase } from '@/integrations/supabase/client';
import { DiscussionPost, DiscussionComment } from '@/types/discussion.types';
import { toast } from 'sonner';

/**
 * Service for managing discussion data with Supabase
 */
export class DiscussionService {
  // Fetch all posts
  static async getPosts(): Promise<DiscussionPost[]> {
    try {
      const { data, error } = await supabase
        .from('discussion_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load discussion posts');
        return [];
      }
      
      return data as DiscussionPost[];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  // Fetch comments for a post
  static async getComments(postId: string): Promise<DiscussionComment[]> {
    try {
      const { data, error } = await supabase
        .from('discussion_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
        toast.error('Failed to load comments');
        return [];
      }
      
      return data as DiscussionComment[];
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return [];
    }
  }

  // Create a new post
  static async createPost(post: Omit<DiscussionPost, 'id' | 'created_at' | 'updated_at'>): Promise<DiscussionPost | null> {
    try {
      const { data, error } = await supabase
        .from('discussion_posts')
        .insert(post)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating post:', error);
        toast.error('Failed to create post');
        return null;
      }
      
      toast.success('Post created successfully');
      return data as DiscussionPost;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  // Create a new comment
  static async createComment(
    comment: Omit<DiscussionComment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DiscussionComment | null> {
    try {
      const { data, error } = await supabase
        .from('discussion_comments')
        .insert(comment)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating comment:', error);
        toast.error('Failed to create comment');
        return null;
      }
      
      toast.success('Comment added successfully');
      return data as DiscussionComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  // Update post votes
  static async updatePostVotes(
    postId: string, 
    upvotes: number, 
    downvotes: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('discussion_posts')
        .update({ upvotes, downvotes })
        .eq('id', postId);
      
      if (error) {
        console.error(`Error updating votes for post ${postId}:`, error);
        toast.error('Failed to update post votes');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating votes for post ${postId}:`, error);
      return false;
    }
  }

  // Update comment votes
  static async updateCommentVotes(
    commentId: string, 
    upvotes: number, 
    downvotes: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('discussion_comments')
        .update({ upvotes, downvotes })
        .eq('id', commentId);
      
      if (error) {
        console.error(`Error updating votes for comment ${commentId}:`, error);
        toast.error('Failed to update comment votes');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating votes for comment ${commentId}:`, error);
      return false;
    }
  }

  // Search posts by query
  static async searchPosts(query: string): Promise<DiscussionPost[]> {
    try {
      const { data, error } = await supabase
        .from('discussion_posts')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Error searching posts with query "${query}":`, error);
        toast.error('Failed to search posts');
        return [];
      }
      
      return data as DiscussionPost[];
    } catch (error) {
      console.error(`Error searching posts with query "${query}":`, error);
      return [];
    }
  }

  // Filter posts by tags
  static async filterPostsByTags(tags: string[]): Promise<DiscussionPost[]> {
    try {
      const { data, error } = await supabase
        .from('discussion_posts')
        .select('*')
        .contains('tags', tags)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Error filtering posts by tags:`, error);
        toast.error('Failed to filter posts');
        return [];
      }
      
      return data as DiscussionPost[];
    } catch (error) {
      console.error(`Error filtering posts by tags:`, error);
      return [];
    }
  }

  // Get post statistics
  static async getPostStatistics(): Promise<{
    totalPosts: number;
    totalComments: number;
    activeUsers: number;
    popularTags: string[];
  }> {
    try {
      // Get post count
      const { count: postsCount, error: postsError } = await supabase
        .from('discussion_posts')
        .select('*', { count: 'exact', head: true });
      
      // Get comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('discussion_comments')
        .select('*', { count: 'exact', head: true });
      
      // Get unique users
      const { data: postsData, error: usersPostsError } = await supabase
        .from('discussion_posts')
        .select('user_id');
      
      const { data: commentsData, error: usersCommentsError } = await supabase
        .from('discussion_comments')
        .select('user_id');
      
      // Get all posts to analyze tags
      const { data: allPosts, error: tagsError } = await supabase
        .from('discussion_posts')
        .select('tags');
      
      if (postsError || commentsError || usersPostsError || usersCommentsError || tagsError) {
        console.error('Error getting statistics:', { postsError, commentsError, usersPostsError, usersCommentsError, tagsError });
        return {
          totalPosts: 0,
          totalComments: 0,
          activeUsers: 0,
          popularTags: []
        };
      }
      
      // Calculate unique users
      const uniqueUserIds = new Set([
        ...(postsData?.map(post => post.user_id) || []),
        ...(commentsData?.map(comment => comment.user_id) || [])
      ]);
      
      // Calculate popular tags
      const tagCounts: Record<string, number> = {};
      allPosts?.forEach(post => {
        (post.tags || []).forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);
      
      return {
        totalPosts: 0,
        totalComments: 0,
        activeUsers: 0,
        popularTags: []
      };
    } catch (error) {
      console.error(`Error getting post statistics:`, error);
      return {
        totalPosts: 0,
        totalComments: 0,
        activeUsers: 0,
        popularTags: []
      };
    }
  }
}
