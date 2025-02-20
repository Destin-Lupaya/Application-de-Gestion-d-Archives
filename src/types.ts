export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  role_type: 'admin' | 'caissier' | 'archiviste' | 'financier' | 'enregistreur' | 'user';
  created_at: string;
  last_login: string;
  documents_count: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  phone_number: string | null;
  role_type: 'admin' | 'caissier' | 'archiviste' | 'financier' | 'enregistreur' | 'user';
  offline_access: boolean;
  last_sync: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
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

export interface OfflineDocument {
  id: string;
  user_id: string;
  document_data: Document;
  created_at: string;
  synced: boolean;
  synced_at: string | null;
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