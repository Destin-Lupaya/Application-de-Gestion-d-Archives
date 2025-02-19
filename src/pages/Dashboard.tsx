import React, { useEffect, useState } from 'react';
import { FileText, File, Presentation, FileSpreadsheet as Spreadsheet } from 'lucide-react';
import type { Statistics } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabaseMock } from '../lib/supabaseMock';
import ArchiveChart from '../components/ArchiveChart';

const supabase = supabaseMock;

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: documents } = await supabase
          .from('documents')
          .select('type, created_at');

        const { data: users } = await supabase
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
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Documents Word</p>
              <p className="text-2xl font-bold">{stats.documentsByType.doc}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <File className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Documents PDF</p>
              <p className="text-2xl font-bold">{stats.documentsByType.pdf}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <Presentation className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Présentations</p>
              <p className="text-2xl font-bold">{stats.documentsByType.ppt}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <Spreadsheet className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Feuilles de calcul</p>
              <p className="text-2xl font-bold">{stats.documentsByType.xls}</p>
            </div>
          </div>
        </div>
      </div>

      <ArchiveChart documents={documents} />

      {user && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Utilisateurs</h2>
          <div className="space-y-4">
            {stats.topUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <p className="text-sm text-gray-500">Inscrit le {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-indigo-600">{user.documents_count}</p>
                  <p className="text-sm text-gray-500">documents</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;