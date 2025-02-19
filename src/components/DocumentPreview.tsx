import React from 'react';
import { X } from 'lucide-react';

interface DocumentPreviewProps {
  document: {
    name: string;
    type: string;
    url: string;
  } | null;
  onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  if (!document) return null;

  const getPreviewContent = () => {
    // Simuler des URLs pour la prévisualisation
    const previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`;

    switch (document.type) {
      case 'pdf':
        return (
          <iframe
            src={previewUrl}
            className="w-full h-full rounded-lg"
            title={document.name}
          />
        );
      case 'doc':
      case 'ppt':
      case 'xls':
        return (
          <iframe
            src={previewUrl}
            className="w-full h-full rounded-lg"
            title={document.name}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Prévisualisation non disponible</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          {getPreviewContent()}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview