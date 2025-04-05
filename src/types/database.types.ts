
export type Profile = {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline: string | null;
  estimated_time: string | null;
  assigned_to: string | null;
  contact_id: string | null;
  created_at: string;
  updated_at: string;
}

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type Attendance = {
  id: string;
  user_id: string;
  task_id: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  notes: string | null;
  status: 'in-progress' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}
