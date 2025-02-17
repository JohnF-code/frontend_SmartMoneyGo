// JohnF-code Jajajaja
// /src/components/NewClientForm.js

import { useState } from 'react';
import Button from './Button';
import clientDB from '@component/db/clientDB.js';

const NewClientForm = ({ onClientCreated }) => {
  const [clientData, setClientData] = useState({
    name: '',
    document: '',
    contact: '',
  });

  const handleChange = (e) => {
    setClientData({
      ...clientData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isOnline = navigator.onLine;
    const tempId = crypto.randomUUID();

    const newClient = {
      ...clientData,
      id: tempId,
      syncStatus: 'pending',
      isFavorite: true,
      date: new Date().toISOString()
    };

    await clientDB.addClient(newClient);

    if (!isOnline && 'serviceWorker' in navigator && 'SyncManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      try {
        await reg.sync.register('sync-clients');
      } catch (err) {
        console.error('Sync registration failed', err);
      }
    }

    if (onClientCreated) onClientCreated(newClient);
    setClientData({ name: '', document: '', contact: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md">
      <h3 className="text-xl font-bold mb-4">Nuevo Cliente</h3>
      <div className="mb-2">
        <label className="block text-sm font-semibold">Nombre:</label>
        <input type="text" name="name" value={clientData.name} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-semibold">Cédula:</label>
        <input type="text" name="document" value={clientData.document} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold">Contacto:</label>
        <input type="text" name="contact" value={clientData.contact} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
      </div>
      <Button type="submit" variant="primary">Crear Cliente</Button>
    </form>
  );
};

export default NewClientForm;
