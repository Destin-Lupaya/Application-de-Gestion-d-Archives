import React from 'react';
import { CloudOff, Cloud as CloudSync, Check } from 'lucide-react';
import { useOfflineMode } from '../hooks/useOfflineMode';

const SyncStatus: React.FC = () => {
  const { isOffline, isSyncing, syncStatus, sync } = useOfflineMode();

  if (!isOffline && !syncStatus.needsSync) {
    return (
      <div className="flex items-center text-green-600">
        <Check className="h-4 w-4 mr-2" />
        <span className="text-sm">Synchronisé</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {isOffline ? (
        <div className="flex items-center text-gray-500">
          <CloudOff className="h-4 w-4 mr-2" />
          <span className="text-sm">Hors ligne</span>
        </div>
      ) : syncStatus.needsSync ? (
        <>
          <div className="flex items-center text-amber-600">
            <CloudSync className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {syncStatus.unsyncedCount} document{syncStatus.unsyncedCount > 1 ? 's' : ''} à synchroniser
            </span>
          </div>
          <button
            onClick={sync}
            disabled={isSyncing}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
          </button>
        </>
      ) : null}
    </div>
  );
};

export default SyncStatus;