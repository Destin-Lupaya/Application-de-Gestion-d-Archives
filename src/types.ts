export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  last_login: string;
  documents_count: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'doc' | 'pdf' | 'ppt' | 'xls';
  url: string;
  user_id: string;
  created_at: string;
  size: number;
}

export interface Statistics {
  totalDocuments: number;
  documentsByType: {
    doc: number;
    pdf: number;
    ppt: number;
    xls: number;
  };
  topUsers: User[];
}