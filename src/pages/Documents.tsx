import React, { useState, useEffect } from 'react';
import { FileText, File, Presentation, FileSpreadsheet as Spreadsheet, Upload, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Document } from '../types';
import { supabaseMock as supabase } from '../lib/supabaseMock';
import DocumentPreview from '../components/DocumentPreview';
import { offlineStorage } from '../services/offlineStorage';
import { useOfflineMode } from '../hooks/useOfflineMode';
import { useNotifications } from '../context/NotificationContext';
import SyncStatus from '../components/SyncStatus';

const Documents = () => {
  const { user } = useAuth();
  const { isOffline } = useOfflineMode();
  const { addNotification } = useNotifications();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [isOffline]);

  const fetchDocuments = async () => {
    if (isOffline) {
      const offlineDocs = await offlineStorage.getAllDocuments();
      setDocuments(offlineDocs.map(doc => doc.document_data));
      return;
    }

    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setDocuments(data);
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

      const document = {
        id: crypto.randomUUID(),
        name: file.name,
        type: fileType,
        url: URL.createObjectURL(file),
        size: file.size,
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
      } as Document;

      if (isOffline) {
        await offlineStorage.saveDocument(document);
        addNotification({
          type: 'info',
          title: 'Document sauvegardé hors ligne',
          message: 'Le document sera synchronisé automatiquement lors de la reconnexion.',
        });
      } else {
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(`${user?.id}/${Date.now()}-${file.name}`, file);

        if (error) throw error;

        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            ...document,
            url: data.path,
          });

        if (dbError) throw dbError;

        addNotification({
          type: 'success',
          title: 'Document téléchargé',
          message: 'Le document a été ajouté avec succès.',
        });
      }

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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'doc': return <FileText className="h-8 w-8 text-blue-500" />;
      case 'pdf': return <File className="h-8 w-8 text-red-500" />;
      case 'ppt': return <Presentation className="h-8 w-8 text-orange-500" />;
      case 'xls': return <Spreadsheet className="h-8 w-8 text-green-500" />;
      default: return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        
        <div className="flex items-center space-x-4">
          <SyncStatus />
          <label className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-start space-x-3">
              {getFileIcon(doc.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {(doc.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => setSelectedDocument(doc)}
                  className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Prévisualiser
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DocumentPreview
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </div>
  );
};

export default Documents;