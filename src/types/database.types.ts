
export interface DatabaseTable {
  name: string;
  schema: string;
}

export interface DatabaseColumn {
  name: string;
  type: string;
  isNullable: boolean;
}

export interface TableData {
  rows: any[];
  columns: DatabaseColumn[];
}

export interface Task {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  estimated_time?: string;
  assigned_to?: string;
  contact_id?: string;
}

export interface Contact {
  id?: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  notes?: string;
  address?: string;
  skills?: string;
  company?: string;
}
