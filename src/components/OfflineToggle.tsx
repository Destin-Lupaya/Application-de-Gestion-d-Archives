import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface OfflineToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const OfflineToggle: React.FC<OfflineToggleProps> = ({ enabled, onToggle }) => {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-700">
        Mode hors ligne
      </span>
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          enabled ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        <span className="sr-only">Activer le mode hors ligne</span>
      </button>
      {enabled ? (
        <WifiOff className="h-4 w-4 text-gray-400" />
      ) : (
        <Wifi className="h-4 w-4 text-indigo-600" />
      )}
    </div>
  );
};

export default OfflineToggle;