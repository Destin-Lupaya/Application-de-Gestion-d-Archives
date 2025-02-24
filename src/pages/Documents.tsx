import React, { useState, useEffect } from 'react';
import { FileText, File, Presentation, FileSpreadsheet as Spreadsheet, Upload, Eye, Search, Filter, Clock, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Document } from '../types';
import { supabase } from '../lib/supabase';
import DocumentPreview from '../components/DocumentPreview';
import { useNotifications } from '../context/NotificationContext';
import SyncStatus from '../components/SyncStatus';

const Documents = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les documents',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExt || '')) {
      addNotification({
        type: 'error',
        title: 'Type de fichier non supporté',
        message: 'Veuillez sélectionner un fichier au format Word, PDF, PowerPoint ou Excel.',
      });
      return;
    }

    try {
      setUploading(true);

      const fileType = fileExt.startsWith('doc') ? 'doc' :
                      fileExt.startsWith('pdf') ? 'pdf' :
                      fileExt.startsWith('ppt') ? 'ppt' : 'xls';

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`${user?.id}/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(`${user?.id}/${fileName}`);

      // Save document metadata to database
      const document = {
        name: file.name,
        type: fileType,
        url: publicUrl,
        size: file.size,
        user_id: user?.id,
      };

      const { error: dbError } = await supabase
        .from('documents')
        .insert(document);

      if (dbError) throw dbError;

      addNotification({
        type: 'success',
        title: 'Document téléchargé',
        message: 'Le document a été ajouté avec succès.',
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de téléchargement',
        message: 'Une erreur est survenue lors du téléchargement du document.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur de téléchargement',
        message: 'Impossible de télécharger le document.',
      });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'doc': return <FileText className="h-8 w-8 text-blue-500" />;
      case 'pdf': return <File className="h-8 w-8 text-red-500" />;
      case 'ppt': return <Presentation className="h-8 w-8 text-orange-500" />;
      case 'xls': return <Spreadsheet className="h-8 w-8 text-green-500" />;
      default: return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Documents archivés</h1>
        
        <div className="flex items-center space-x-4">
          <SyncStatus />
          <label className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer transition-colors">
            <Upload className="h-5 w-5 mr-2" />
            <span>Télécharger</span>
            <input
              type="file"
              className="hidden"
              accept=".doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tous les types</option>
              <option value="doc">Word</option>
              <option value="pdf">PDF</option>
              <option value="ppt">PowerPoint</option>
              <option value="xls">Excel</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="date">Date</option>
              <option value="name">Nom</option>
              <option value="size">Taille</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors duration-200">
              <div className="flex items-start space-x-3">
                {getFileIcon(doc.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="mt-3 flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedDocument(doc)}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Prévisualiser
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-500"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par télécharger un document.
            </p>
          </div>
        )}
      </div>

      <DocumentPreview
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </div>
  );
};

export default Documents;