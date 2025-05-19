const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function generateRSAKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${arrayBufferToBase64(publicKey)}\n-----END PUBLIC KEY-----`;
  const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${arrayBufferToBase64(privateKey)}\n-----END PRIVATE KEY-----`;

  return { publicKeyPem, privateKeyPem };
}

async function generateAESKey() {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

async function importRSAPublicKey(pem) {
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  const pemContents = pem.replace(pemHeader, '').replace(pemFooter, '').trim();
  const binaryDer = base64ToArrayBuffer(pemContents);
  
  return await crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
}

async function importRSAPrivateKey(pem) {
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = pem.replace(pemHeader, '').replace(pemFooter, '').trim();
  const binaryDer = base64ToArrayBuffer(pemContents);
  
  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  );
}

async function encryptData(data, aesKey, iv) {
  const ivBuffer = iv ? base64ToArrayBuffer(iv) : crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    aesKey,
    encoder.encode(data)
  );

  return {
    encryptedData: arrayBufferToBase64(encrypted),
    iv: iv ? iv : arrayBufferToBase64(ivBuffer),
  };
}

async function decryptData(encryptedData, aesKey, iv) {
  const encryptedBuffer = base64ToArrayBuffer(encryptedData);
  const ivBuffer = base64ToArrayBuffer(iv);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    aesKey,
    encryptedBuffer
  );
  return decoder.decode(decrypted);
}

async function decryptFile(encryptedData, aesKey, iv) {
  const encryptedBuffer = base64ToArrayBuffer(encryptedData);
  const ivBuffer = base64ToArrayBuffer(iv);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    aesKey,
    encryptedBuffer
  );
  return new Uint8Array(decrypted); // Return raw binary data
}

async function unwrapAESKey(encryptedAESKey, rsaPrivateKey) {
  const encryptedKeyBuffer = base64ToArrayBuffer(encryptedAESKey);
  const decryptedKey = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    rsaPrivateKey,
    encryptedKeyBuffer
  );
  return await crypto.subtle.importKey(
    'raw',
    decryptedKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encryptAndWrap(data, publicKeyPem, existingEncryptedAESKey = null, existingIV = null) {
  let aesKey;
  let encryptedAESKey = existingEncryptedAESKey;
  let iv = existingIV;

  if (!existingEncryptedAESKey) {
    aesKey = await generateAESKey();
    const rsaPublicKey = await importRSAPublicKey(publicKeyPem);
    encryptedAESKey = await wrapAESKey(aesKey, rsaPublicKey);
  } else {
    aesKey = null; // Placeholder; actual key will be unwrapped later
  }

  const { encryptedData, iv: newIV } = await encryptData(data, aesKey, iv);
  iv = iv || newIV;

  return { encryptedData, iv, encryptedAESKey };
}

async function decryptItem(encryptedData, encryptedAESKey, iv, privateKeyPem) {
  const rsaPrivateKey = await importRSAPrivateKey(privateKeyPem);
  const aesKey = await unwrapAESKey(encryptedAESKey, rsaPrivateKey);
  return await decryptData(encryptedData, aesKey, iv); // For text data
}

async function decryptFileItem(encryptedData, encryptedAESKey, iv, privateKeyPem) {
  const rsaPrivateKey = await importRSAPrivateKey(privateKeyPem);
  const aesKey = await unwrapAESKey(encryptedAESKey, rsaPrivateKey);
  return await decryptFile(encryptedData, aesKey, iv); // For binary file data
}

// IndexedDB helpers
const DB_NAME = 'CryptoKeysDB';
const STORE_NAME = 'keys';
const VERSION = 1;

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: 'username' });
    };
  });
}

async function storePrivateKey(username, privateKeyPem) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ username, privateKeyPem });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function getPrivateKey(username) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(username);
    request.onsuccess = () => resolve(request.result?.privateKeyPem || null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function clearPrivateKey(username) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(username);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function wrapAESKey(aesKey, rsaPublicKey) {
  const wrappedKey = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    rsaPublicKey,
    await crypto.subtle.exportKey('raw', aesKey)
  );
  return arrayBufferToBase64(wrappedKey);
}

async function encryptFile(file, aesKey) {
  const fileBuffer = await file.arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    fileBuffer
  );
  // Convert iv to base64 in a browser-compatible way
  const ivBase64 = btoa(String.fromCharCode(...iv));
  return {
    encryptedData: new Uint8Array(encryptedData),
    iv: ivBase64,
  };
}

export {
  encryptAndWrap,
  generateRSAKeyPair,
  storePrivateKey,
  getPrivateKey,
  clearPrivateKey,
  decryptItem,
  decryptFileItem, // New export for binary file decryption
  generateAESKey,
  importRSAPublicKey,
  wrapAESKey,
  encryptData,
  encryptFile,
  unwrapAESKey,
  base64ToArrayBuffer,
  importRSAPrivateKey,
  decryptData,
  decryptFile, // New export for binary file decryption
  arrayBufferToBase64,
};