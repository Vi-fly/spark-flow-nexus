export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: number
          name: string
          email: string | null
          phone: number | null
          address: string | null
          skills: string[] | null
          notes: string
        }
        Insert: {
          id?: number
          name: string
          email?: string | null
          phone?: number | null
          address?: string | null
          skills?: string[] | null
          notes: string
        }
        Update: {
          id?: number
          name?: string
          email?: string | null
          phone?: number | null
          address?: string | null
          skills?: string[] | null
          notes?: string
        }
        Relationships: []
      }
      discussion_comments: {
        Row: {
          content: string
          created_at: string
          downvotes: number
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          downvotes?: number
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          downvotes?: number
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_comments_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "discussion_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_comments_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      discussion_posts: {
        Row: {
          content: string
          created_at: string
          downvotes: number
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          downvotes?: number
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          downvotes?: number
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          user_id: string
          email: string
          name: string | null
        }
        Insert: {
          user_id: string
          email: string
          name?: string | null
        }
        Update: {
          user_id?: string
          email?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: number
          title: string
          description: string
          category: string
          priority: 'Low' | 'Medium' | 'High'
          expected_outcome: string
          deadline: string | Date // ISO date string
          assigned_to: number 
          dependencies: string | null
          required_resources: string | null
          estimated_time: string
          instructions: string | null
          review_process: string | null
          performance_metrics: string | null
          support_contact: number | null
          notes: string | null
          status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Reviewed & Approved'
          created_at: string | Date | null
          updated_at: string | Date | null
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          title: string
          description: string
          category: string
          priority: 'Low' | 'Medium' | 'High'
          expected_outcome: string
          deadline: string | Date
          assigned_to?: number 
          dependencies?: string | null
          required_resources?: string | null
          estimated_time: string
          instructions: string | null
          review_process: string | null
          performance_metrics?: string | null
          support_contact?: number | null
          notes: string | null
          status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Reviewed & Approved'
          created_at?: string | null
          updated_at?: string | null
          started_at?: string | Date | null
          completed_at?: string | Date | null
        }
        Update: {
          title?: string
          description?: string
          category?: string
          priority?: 'Low' | 'Medium' | 'High'
          expected_outcome?: string
          deadline?: string| Date
          assigned_to?: number 
          dependencies?: string | null
          required_resources?: string | null
          estimated_time?: string
          instructions?: string | null
          review_process?: string | null
          performance_metrics?: string | null
          support_contact?: number | null
          notes?: string | null
          status?: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Reviewed & Approved'
          updated_at?: string | Date
          started_at?: string | Date | null
          completed_at?: string | Date | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_support_contact_fkey"
            columns: ["support_contact"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_contacts_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_posts_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_tasks_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      drop_all_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
