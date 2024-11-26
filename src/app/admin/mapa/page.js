"use client";
import { useState } from 'react';
import axios from 'axios';

export default function AddressForm() {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Autocompletar mientras el usuario escribe
  const handleAutocomplete = async (event) => {
    const input = event.target.value;
    setAddress(input);

    if (input.length > 2) {
      try {
          const response = await axios.get(`/api/googleAutocomplete?input=${input}`, {
              headers: {
                  'Content-Type': 'application/json'
              }
        });
        setSuggestions(response.data.predictions); // Guardamos las sugerencias
      } catch (err) {
        console.error('Error fetching autocomplete suggestions', err);
      }
    } else {
      setSuggestions([]); // Limpiamos las sugerencias si el input es corto
    }
  };

  return (
    <div>
      <h2>Buscar Dirección en Colombia</h2>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={address}
          onChange={handleAutocomplete}
          placeholder="Ingresa tu dirección"
          style={{ width: '300px', padding: '10px', marginRight: '10px' }}
        />
      </div>

      {/* Mostrar sugerencias debajo del input */}
      {suggestions.length > 0 && (
        <ul style={{ border: '1px solid #ccc', maxWidth: '300px', marginTop: '10px' }}>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              style={{ padding: '10px', cursor: 'pointer' }}
              onClick={() => setAddress(suggestion.description)}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}