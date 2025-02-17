// JohnF-code Jajajaja
// /src/utils/crypto.js

export function hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    return crypto.subtle.digest('SHA-256', dataBuffer)
      .then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      });
  }
  