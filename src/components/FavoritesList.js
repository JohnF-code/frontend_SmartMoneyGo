// JohnF-code Jajajaja
// /src/components/FavoritesList.js

import { useEffect, useState } from 'react';
import clientDB from "@component/db/clientDB.js";


const SyncBadge = ({ status }) => {
  let label = '';
  if (status === 'pending') label = '🔄 Enviando...';
  else if (status === 'failed') label = '❌ Error';
  else if (status === 'synced') label = '✅ Sincronizado';
  return <span className={`badge-${status}`}>{label}</span>;
};

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    async function loadFavorites() {
      const favs = await clientDB.getFavorites();
      setFavorites(favs);
    }
    loadFavorites();

    const observer = clientDB.onChange(async () => {
      const favs = await clientDB.getFavorites();
      setFavorites(favs);
    });
    return () => observer.unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded mb-4">
      <h3 className="text-lg font-bold mb-2">Favoritos</h3>
      <ul>
        {favorites.map(client => (
          <li key={client.id} className="mb-1">
            {client.name} <SyncBadge status={client.syncStatus} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FavoritesList;
