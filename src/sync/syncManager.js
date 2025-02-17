// JohnF-code Jajajaja
// /src/sync/syncManager.js

import clientDB from '@component/db/clientDB.js';

export async function syncClients() {
  const pendingClients = await clientDB.getByStatus('pending');
  
  for (const client of pendingClients) {
    try {
      const response = await fetch('/api/clients', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(client)
      });
      
      if (response.ok) {
        await clientDB.updateStatus(client.id, 'synced');
      } else {
        await clientDB.updateStatus(client.id, 'failed');
      }
    } catch (error) {
      await clientDB.updateStatus(client.id, 'failed');
      console.error('Sync error for client:', client.id, error);
    }
  }
}
