import { User } from '../types';

// Simulated database
const db = {
  users: [
    {
      id: '1',
      email: 'admin@archivesystem.com',
      role: 'admin' as const,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      documents_count: 0,
    },
    {
      id: '2',
      email: 'user@archivesystem.com',
      role: 'user' as const,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      documents_count: 0,
    },
  ],
  documents: [],
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
        },
      };

      db.sessions.set(user.id, session);
      return { data: { session }, error: null };
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      if (db.users.some(u => u.email === email)) {
        return { error: { message: 'User already registered' } };
      }

      if (password.length < 6) {
        return { error: { message: 'Password should be at least 6 characters' } };
      }

      const newUser = {
        id: String(db.users.length + 1),
        email,
        role: 'user' as const,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        documents_count: 0,
      };

      db.users.push(newUser);
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
      // Simulate auth state change
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
      order: (column: string, { ascending }: { ascending: boolean }) => ({
        limit: (n: number) => {
          let data = [];
          if (table === 'profiles') {
            data = db.users;
          } else if (table === 'documents') {
            data = db.documents;
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
      }
      return { error: null };
    },
  }),

  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        return { data: { path }, error: null };
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