import React, { useEffect, useState } from 'react';
import { FileText, File, Presentation, FileSpreadsheet as Spreadsheet, TrendingUp, Users as UsersIcon, Clock, Calendar } from 'lucide-react';
import type { Statistics } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabaseMock } from '../lib/supabaseMock';
import ArchiveChart from '../components/ArchiveChart';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Statistics>({
    totalDocuments: 0,
    documentsByType: {
      doc: 0,
      pdf: 0,
      ppt: 0,
      xls: 0,
    },
    topUsers: [],
  });
  const [documents, setDocuments] = useState<Array<{ created_at: string; type: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: documents } = await supabaseMock
          .from('documents')
          .select('type, created_at');

        const { data: users } = await supabaseMock
          .from('profiles')
          .select('*')
          .order('documents_count', { ascending: false })
          .limit(5);

        if (documents) {
          const documentsByType = documents.reduce(
            (acc, doc) => {
              acc[doc.type as keyof typeof acc] += 1;
              return acc;
            },
            { doc: 0, pdf: 0, ppt: 0, xls: 0 }
          );

          setStats({
            totalDocuments: documents.length,
            documentsByType,
            topUsers: users || [],
          });
          setDocuments(documents);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-500">
            Vue d'ensemble de votre système d'archivage
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-50 px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <span className="text-sm text-gray-700">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-indigo-500 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Documents Word</p>
              <p className="text-2xl font-bold text-gray-900">{stats.documentsByType.doc}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Mis à jour à l'instant</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-red-500 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <File className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Documents PDF</p>
              <p className="text-2xl font-bold text-gray-900">{stats.documentsByType.pdf}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Mis à jour à l'instant</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-orange-500 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Presentation className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Présentations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.documentsByType.ppt}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Mis à jour à l'instant</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-500 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Spreadsheet className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Feuilles de calcul</p>
              <p className="text-2xl font-bold text-gray-900">{stats.documentsByType.xls}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Mis à jour à l'instant</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Évolution des archives</h2>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                <span className="text-sm text-gray-500">Tendances mensuelles</span>
              </div>
            </div>
            <ArchiveChart documents={documents} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Top Utilisateurs</h2>
              <UsersIcon className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="space-y-4">
              {stats.topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-indigo-600">
                      {user.documents_count}
                    </p>
                    <p className="text-xs text-gray-500">documents</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;