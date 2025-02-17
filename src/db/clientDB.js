// JohnF-code Jajajaja
// /src/db/clientDB.js

import { openDB } from 'idb';

const DB_NAME = 'ClientsDB';
const STORE_NAME = 'clients';
const DB_VERSION = 1;

const clientDB = {
  db: null,
  async init() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('syncStatus', 'syncStatus');
          store.createIndex('isFavorite', 'isFavorite');
        }
      }
    });
  },
  async addClient(client) {
    return await this.db.add(STORE_NAME, client);
  },
  async getClient(id) {
    return await this.db.get(STORE_NAME, id);
  },
  async getFavorites() {
    // Retorna todos los clientes marcados como favoritos (true)
    return await this.db.getAllFromIndex(STORE_NAME, 'isFavorite', IDBKeyRange.only(true));
  },
  async getByStatus(status) {
    return await this.db.getAllFromIndex(STORE_NAME, 'syncStatus', status);
  },
  async updateStatus(id, status) {
    const client = await this.getClient(id);
    if (client) {
      client.syncStatus = status;
      await this.db.put(STORE_NAME, client);
    }
  },
  async updateClient(client) {
    await this.db.put(STORE_NAME, client);
  },
  onChange(callback) {
    // Implementación básica de observer mediante polling (cada 5 segundos)
    const interval = setInterval(callback, 5000);
    return {
      unsubscribe() {
        clearInterval(interval);
      }
    };
  }
};

export default clientDB;
