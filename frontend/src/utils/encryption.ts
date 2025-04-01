import { box, randomBytes } from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

export const generateKeyPair = () => {
  const keyPair = box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey)
  };
};

export const encryptFile = async (file: File, publicKey: Uint8Array): Promise<{ encrypted: Uint8Array, key: Uint8Array }> => {
  const fileKey = randomBytes(box.secretKeyLength);
  const nonce = randomBytes(box.nonceLength);
  
  const fileBuffer = await file.arrayBuffer();
  const encrypted = box(new Uint8Array(fileBuffer), nonce, publicKey, fileKey);
  
  return {
    encrypted: encrypted,
    key: fileKey
  };
};

export const decryptFile = (encrypted: Uint8Array, key: Uint8Array, secretKey: Uint8Array): Uint8Array => {
  const nonce = encrypted.slice(0, box.nonceLength);
  const message = encrypted.slice(box.nonceLength);
  
  const decrypted = box.open(message, nonce, key, secretKey);
  if (!decrypted) throw new Error('Failed to decrypt file');
  
  return decrypted;
};