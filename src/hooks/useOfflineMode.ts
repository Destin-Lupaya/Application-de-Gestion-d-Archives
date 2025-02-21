import { useState, useEffect } from 'react';
import { syncService } from '../services/syncService';

export function useOfflineMode() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    needsSync: false,
    unsyncedCount: 0,
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkSync = async () => {
      const status = await syncService.checkSyncStatus();
      setSyncStatus(status);
    };

    checkSync();
  }, [isOffline]);

  const sync = async () => {
    if (isSyncing || isOffline) return;

    setIsSyncing(true);
    try {
      const result = await syncService.syncOfflineDocuments();
      if (result.success) {
        const status = await syncService.checkSyncStatus();
        setSyncStatus(status);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOffline,
    isSyncing,
    syncStatus,
    sync,
  };
}