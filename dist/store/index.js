/**
 * In-memory key store. Keys are lost when process exits.
 */
export class MemoryKeyStore {
    privateKey = null;
    publicKey = null;
    agentId = null;
    async getPrivateKey() { return this.privateKey; }
    async getPublicKey() { return this.publicKey; }
    async getAgentId() { return this.agentId; }
    async store(privateKey, publicKey, agentId) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.agentId = agentId;
    }
    async clear() {
        this.privateKey = null;
        this.publicKey = null;
        this.agentId = null;
    }
}
//# sourceMappingURL=index.js.map