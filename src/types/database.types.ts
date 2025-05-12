
export interface DatabaseTable {
  name: string;
  schema: string;
}

export interface DatabaseColumn {
  name: string;
  type: string;
  isNullable: boolean;
  defaultValue?: string[] | string | null;
}

export interface TableData {
  rows: any[];
  columns: DatabaseColumn[];
}


export interface Task {
  id?: number;
  title: string;
  description?: string;
  category: string;
  expected_outcome: string;
  instructions: string;
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Reviewed & Approved';
  priority: 'Low' | 'Medium' | 'High';
  review_process?: string | null;
  performance_metrics?: string | null;
  support_contact?: number | null;
  notes?: string | null;
  deadline?: string | Date;
  estimated_time?: string;
  assigned_to?: number;
  dependencies?: string | null;
  required_resources?: string | null;
  started_at?: Date | string | null;
  completed_at?: Date | string | null ;}

export interface Contact {
  id?: number;
  name: string;
  email?: string;
  phone?: number;
  address?: string;
  skills: string[];
  notes: string;
}
