import { User, Document, UserProfile, Contact, OfflineDocument } from '../types';

// Simulated database
const db = {
  users: [
    {
      id: '1',
      email: 'admin@archivesystem.com',
      role: 'admin' as const,
      role_type: 'admin' as const,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      documents_count: 0,
    },
    {
      id: '2',
      email: 'user@archivesystem.com',
      role: 'user' as const,
      role_type: 'archiviste' as const,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      documents_count: 0,
    },
  ],
  user_profiles: [
    {
      id: '1',
      user_id: '1',
      avatar_url: null,
      phone_number: null,
      role_type: 'admin',
      offline_access: true,
      last_sync: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: '2',
      avatar_url: null,
      phone_number: null,
      role_type: 'archiviste',
      offline_access: true,
      last_sync: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  contacts: [],
  documents: [],
  offline_documents: [],
  sessions: new Map(),
};

// Mock Supabase client
export const supabaseMock = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const user = db.users.find(u => u.email === email);
      
      if (!user || (email === 'admin@archivesystem.com' && password !== 'admin') || 
          (email === 'user@archivesystem.com' && password !== 'user123')) {
        return { error: { message: 'Invalid login credentials' } };
      }

      const session = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          role_type: user.role_type,
        },
      };

      db.sessions.set(user.id, session);
      return { data: { session }, error: null };
    },

    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      if (db.users.some(u => u.email === email)) {
        return { error: { message: 'User already registered' } };
      }

      if (password.length < 6) {
        return { error: { message: 'Password should be at least 6 characters' } };
      }

      const role_type = options?.data?.role_type || 'user';

      const newUser = {
        id: String(db.users.length + 1),
        email,
        role: 'user' as const,
        role_type,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        documents_count: 0,
      };

      const newProfile = {
        id: String(db.user_profiles.length + 1),
        user_id: newUser.id,
        avatar_url: null,
        phone_number: null,
        role_type,
        offline_access: true,
        last_sync: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.users.push(newUser);
      db.user_profiles.push(newProfile);
      return { data: { user: newUser }, error: null };
    },

    signOut: async () => {
      db.sessions.clear();
      return { error: null };
    },

    getSession: async () => {
      const session = Array.from(db.sessions.values())[0];
      return { data: { session }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      callback('SIGNED_IN', Array.from(db.sessions.values())[0]);
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  },

  from: (table: string) => ({
    select: (query: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: () => {
          let data = null;
          if (table === 'user_profiles') {
            data = db.user_profiles.find(p => p[column as keyof UserProfile] === value);
          }
          return { data, error: null };
        },
      }),
      order: (column: string, { ascending }: { ascending: boolean }) => ({
        limit: (n: number) => {
          let data = [];
          if (table === 'profiles') {
            data = db.users;
          } else if (table === 'documents') {
            data = db.documents;
          } else if (table === 'user_profiles') {
            data = db.user_profiles;
          } else if (table === 'contacts') {
            data = db.contacts;
          } else if (table === 'offline_documents') {
            data = db.offline_documents;
          }
          return { data, error: null };
        },
      }),
    }),
    insert: (data: any) => {
      if (table === 'documents') {
        const newDoc = { id: String(db.documents.length + 1), ...data };
        db.documents.push(newDoc);
        const user = db.users.find(u => u.id === data.user_id);
        if (user) {
          user.documents_count++;
        }
        return { data: newDoc, error: null };
      } else if (table === 'user_profiles') {
        const newProfile = { id: String(db.user_profiles.length + 1), ...data };
        db.user_profiles.push(newProfile);
        return { data: newProfile, error: null };
      } else if (table === 'contacts') {
        const newContact = { id: String(db.contacts.length + 1), ...data };
        db.contacts.push(newContact);
        return { data: newContact, error: null };
      } else if (table === 'offline_documents') {
        const newOfflineDoc = { id: String(db.offline_documents.length + 1), ...data };
        db.offline_documents.push(newOfflineDoc);
        return { data: newOfflineDoc, error: null };
      }
      return { error: null };
    },
    update: (data: any) => ({
      eq: (column: string, value: any) => {
        if (table === 'user_profiles') {
          const profile = db.user_profiles.find(p => p[column as keyof UserProfile] === value);
          if (profile) {
            Object.assign(profile, data);
            return { data: profile, error: null };
          }
        }
        return { error: null };
      },
    }),
  }),

  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `https://fake-storage.com/${path}` } };
      },
    }),
  },
};

// Helper function to get mock credentials
export const getMockCredentials = () => ({
  admin: {
    email: 'admin@archivesystem.com',
    password: 'admin',
  },
  user: {
    email: 'user@archivesystem.com',
    password: 'user123',
  },
});