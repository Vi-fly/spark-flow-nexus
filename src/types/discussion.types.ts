
export type DiscussionPost = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type DiscussionComment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  parent_id: string | null; // For nested comments/replies
  created_at: string;
  updated_at: string;
}
