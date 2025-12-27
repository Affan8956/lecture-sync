
import { User, ChatSession, LabAsset } from '../types';

const DB_NAME = 'StudyEasierDB';
const DB_VERSION = 1;

/**
 * Robust Local Database Service (IndexedDB)
 * This mimics a real production database (like MongoDB or Postgres) 
 * but runs entirely in the user's browser for privacy and speed.
 */
class StudyEasierDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject('Database failed to open');
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        // Create tables (Object Stores)
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
      };
    });
  }

  // Generic CRUD helpers
  private async performAction(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<any> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = action(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // --- USER OPERATIONS ---
  async saveUser(user: any): Promise<void> {
    await this.performAction('users', 'readwrite', (s) => s.put(user));
  }

  async getUsers(): Promise<any[]> {
    return this.performAction('users', 'readonly', (s) => s.getAll());
  }

  // --- CHAT OPERATIONS ---
  async saveChat(chat: ChatSession): Promise<void> {
    await this.performAction('chats', 'readwrite', (s) => s.put(chat));
  }

  async getChats(userId: string): Promise<ChatSession[]> {
    const allChats: ChatSession[] = await this.performAction('chats', 'readonly', (s) => s.getAll());
    return allChats.filter(c => c.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deleteChat(id: string): Promise<void> {
    await this.performAction('chats', 'readwrite', (s) => s.delete(id));
  }

  // --- ASSET OPERATIONS ---
  async saveAsset(asset: LabAsset): Promise<void> {
    await this.performAction('assets', 'readwrite', (s) => s.put(asset));
  }

  async getAssets(userId: string): Promise<LabAsset[]> {
    const allAssets: LabAsset[] = await this.performAction('assets', 'readonly', (s) => s.getAll());
    return allAssets.filter(a => a.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const db = new StudyEasierDatabase();
