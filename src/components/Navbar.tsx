import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileArchive, LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <FileArchive className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">ArchiveSystem</span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Tableau de bord</span>
              </Link>
              
              <Link
                to="/documents"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/documents'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileArchive className="h-4 w-4" />
                <span>Documents</span>
              </Link>
              
              {user.role === 'admin' && (
                <Link
                  to="/users"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/users'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Utilisateurs</span>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;