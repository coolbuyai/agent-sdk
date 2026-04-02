import fs from 'node:fs/promises';
import type { KeyStore } from './index.js';

interface FileKeyData {
  privateKey: string;  // hex
  publicKey: string;   // hex
  agentId: string;
}

/**
 * File-based key store with 0600 permissions.
 * Persists keys across process restarts.
 */
export class FileKeyStore implements KeyStore {
  private filePath: string;
  private cache: FileKeyData | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private async load(): Promise<FileKeyData | null> {
    if (this.cache) return this.cache;
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      this.cache = JSON.parse(content) as FileKeyData;
      return this.cache;
    } catch {
      return null;
    }
  }

  async getPrivateKey(): Promise<Uint8Array | null> {
    const data = await this.load();
    return data ? Buffer.from(data.privateKey, 'hex') : null;
  }

  async getPublicKey(): Promise<string | null> {
    const data = await this.load();
    return data?.publicKey ?? null;
  }

  async getAgentId(): Promise<string | null> {
    const data = await this.load();
    return data?.agentId ?? null;
  }

  async store(privateKey: Uint8Array, publicKey: string, agentId: string): Promise<void> {
    const data: FileKeyData = {
      privateKey: Buffer.from(privateKey).toString('hex'),
      publicKey,
      agentId,
    };
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
    this.cache = data;
  }

  async clear(): Promise<void> {
    this.cache = null;
    try { await fs.unlink(this.filePath); } catch { /* ignore */ }
  }
}
