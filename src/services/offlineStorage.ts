import localforage from 'localforage';
import type { Document, OfflineDocument } from '../types';

// Configuration de localforage
localforage.config({
  name: 'archiveSystem',
  storeName: 'documents',
});

export const offlineStorage = {
  async saveDocument(document: Document): Promise<void> {
    const offlineDoc: OfflineDocument = {
      id: crypto.randomUUID(),
      user_id: document.user_id,
      document_data: document,
      created_at: new Date().toISOString(),
      synced: false,
      synced_at: null,
    };

    const key = `offline_doc_${offlineDoc.id}`;
    await localforage.setItem(key, offlineDoc);
  },

  async getUnsynced(): Promise<OfflineDocument[]> {
    const unsynced: OfflineDocument[] = [];
    
    await localforage.iterate<OfflineDocument, void>((value) => {
      if (!value.synced) {
        unsynced.push(value);
      }
    });

    return unsynced;
  },

  async markAsSynced(id: string): Promise<void> {
    const key = `offline_doc_${id}`;
    const doc = await localforage.getItem<OfflineDocument>(key);
    
    if (doc) {
      doc.synced = true;
      doc.synced_at = new Date().toISOString();
      await localforage.setItem(key, doc);
    }
  },

  async removeDocument(id: string): Promise<void> {
    const key = `offline_doc_${id}`;
    await localforage.removeItem(key);
  },

  async getAllDocuments(): Promise<OfflineDocument[]> {
    const documents: OfflineDocument[] = [];
    
    await localforage.iterate<OfflineDocument, void>((value) => {
      documents.push(value);
    });

    return documents;
  },

  async clearSynced(): Promise<void> {
    const syncedDocs = await this.getAllDocuments();
    
    for (const doc of syncedDocs) {
      if (doc.synced) {
        await this.removeDocument(doc.id);
      }
    }
  },
};