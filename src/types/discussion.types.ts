export type DiscussionPost = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  user_profile?: {
    user_id: string;
    email: string;
    name?: string;
  }
};

export type DiscussionComment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: {
    user_id: string;
    email: string;
    name?: string;
  }
};

export type VoteType = "upvote" | "downvote" | null;
export type ContentType = "post" | "comment";

export type UserVoteRecord = {
  type: ContentType;
  vote: VoteType;
};

export type UserVotes = Record<string, UserVoteRecord>;