// ── Main SDK Entry Point ──

export { createCoolBuyClient } from './client/index.js';
export type { CoolBuyClient } from './client/index.js';

// Crypto
export { generateKeyPair, deriveAgentId, buildCoolBuyHeaders, signMessage, generateNonce } from './crypto/index.js';
export type { KeyPairResult, CoolBuyHeaders } from './crypto/index.js';

// Key Stores
export { MemoryKeyStore } from './store/index.js';
export { FileKeyStore } from './store/file.js';
export type { KeyStore } from './store/index.js';

// Types
export type {
  CoolBuyClientConfig,
  AgentInfo,
  Product,
  Order,
  OrderItem,
  Wallet,
  DashboardToken,
  ApiResponse,
  PaginatedResponse,
} from './types/index.js';
