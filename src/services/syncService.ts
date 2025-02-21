import { createClient } from '@supabase/supabase-js';
import { offlineStorage } from './offlineStorage';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const syncService = {
  async syncOfflineDocuments(): Promise<{
    success: boolean;
    synced: number;
    errors: number;
  }> {
    const unsynced = await offlineStorage.getUnsynced();
    let synced = 0;
    let errors = 0;

    for (const offlineDoc of unsynced) {
      try {
        const { error } = await supabase
          .from('documents')
          .insert(offlineDoc.document_data);

        if (error) {
          throw error;
        }

        await offlineStorage.markAsSynced(offlineDoc.id);
        synced++;
      } catch (error) {
        console.error('Sync error for document:', offlineDoc.id, error);
        errors++;
      }
    }

    if (synced > 0) {
      await offlineStorage.clearSynced();
    }

    return {
      success: errors === 0,
      synced,
      errors,
    };
  },

  async checkSyncStatus(): Promise<{
    needsSync: boolean;
    unsyncedCount: number;
  }> {
    const unsynced = await offlineStorage.getUnsynced();
    return {
      needsSync: unsynced.length > 0,
      unsyncedCount: unsynced.length,
    };
  },
};