import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Users, Database, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserManagement from '../components/UserManagement';
import OfflineToggle from '../components/OfflineToggle';
import type { UserProfile } from '../types';
import { supabaseMock as supabase } from '../lib/supabaseMock';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select()
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleOfflineToggle = async (enabled: boolean) => {
    if (user && profile) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ offline_access: enabled })
        .eq('user_id', user.id);

      if (!error) {
        setProfile({ ...profile, offline_access: enabled });
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Veuillez vous connecter pour accéder aux paramètres.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-2 mb-8">
        <SettingsIcon className="h-6 w-6 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('general')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="h-4 w-4 inline-block mr-2" />
              Général
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline-block mr-2" />
                Utilisateurs
              </button>
            )}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-4 w-4 inline-block mr-2" />
              Notifications
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres généraux</h3>
                {profile && (
                  <OfflineToggle
                    enabled={profile.offline_access}
                    onToggle={handleOfflineToggle}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && user.role === 'admin' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des utilisateurs</h3>
                <UserManagement onUserCreated={() => {}} />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres de notification</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      true ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        true ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notifications SMS</p>
                    <p className="text-sm text-gray-500">Recevoir des notifications par SMS</p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      false ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        false ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;