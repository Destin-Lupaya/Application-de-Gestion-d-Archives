import React, { useState } from 'react';
import { Plus, UserPlus, Mail, Key } from 'lucide-react';
import RoleSelector from './RoleSelector';
import { supabaseMock as supabase } from '../lib/supabaseMock';

interface UserManagementProps {
  onUserCreated: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role_type: 'user',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            role_type: newUser.role_type,
          },
        },
      });

      if (signUpError) throw signUpError;

      setNewUser({ email: '', password: '', role_type: 'user' });
      setIsCreating(false);
      onUserCreated();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (!isCreating) {
    return (
      <button
        onClick={() => setIsCreating(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Créer un utilisateur
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Créer un nouvel utilisateur</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>Email</span>
            </div>
          </label>
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-gray-400" />
              <span>Mot de passe</span>
            </div>
          </label>
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            minLength={6}
          />
        </div>

        <RoleSelector
          value={newUser.role_type}
          onChange={(value) => setNewUser({ ...newUser, role_type: value })}
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserManagement;