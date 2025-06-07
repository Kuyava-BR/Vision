import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY não definida nas variáveis de ambiente. Defina uma chave de 32 caracteres.');
}

export class EncryptionService {
  private static getKey(salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(ENCRYPTION_KEY!, salt, PBKDF2_ITERATIONS, 32, 'sha512');
  }

  static encrypt(text: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = this.getKey(salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
  }

  static decrypt(encryptedText: string): string {
    try {
      const encryptedBuffer = Buffer.from(encryptedText, 'hex');
      const salt = encryptedBuffer.slice(0, SALT_LENGTH);
      const iv = encryptedBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const tag = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      const encrypted = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      
      const key = this.getKey(salt);
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (error) {
      console.error("Falha ao descriptografar:", error);
      return ''; // Retorna vazio em caso de falha para evitar quebras
    }
  }
} 