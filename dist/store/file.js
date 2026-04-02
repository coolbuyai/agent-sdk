import fs from 'node:fs/promises';
/**
 * File-based key store with 0600 permissions.
 * Persists keys across process restarts.
 */
export class FileKeyStore {
    filePath;
    cache = null;
    constructor(filePath) {
        this.filePath = filePath;
    }
    async load() {
        if (this.cache)
            return this.cache;
        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            this.cache = JSON.parse(content);
            return this.cache;
        }
        catch {
            return null;
        }
    }
    async getPrivateKey() {
        const data = await this.load();
        return data ? Buffer.from(data.privateKey, 'hex') : null;
    }
    async getPublicKey() {
        const data = await this.load();
        return data?.publicKey ?? null;
    }
    async getAgentId() {
        const data = await this.load();
        return data?.agentId ?? null;
    }
    async store(privateKey, publicKey, agentId) {
        const data = {
            privateKey: Buffer.from(privateKey).toString('hex'),
            publicKey,
            agentId,
        };
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
        this.cache = data;
    }
    async clear() {
        this.cache = null;
        try {
            await fs.unlink(this.filePath);
        }
        catch { /* ignore */ }
    }
}
//# sourceMappingURL=file.js.map