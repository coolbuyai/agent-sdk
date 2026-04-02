import { generateKeyPair } from '../crypto/keys.js';
import { MemoryKeyStore } from '../store/index.js';
import type { KeyStore } from '../store/index.js';
import { HttpClient } from './http.js';
import type {
  CoolBuyClientConfig,
  AgentInfo,
  Product,
  Order,
  Wallet,
  DashboardToken,
  ApiResponse,
  PaginatedResponse,
} from '../types/index.js';

const DEFAULT_BASE_URL = process.env.COOLBUY_API_URL || 'http://54.226.156.136:4000/api/v1';

export interface CoolBuyClient {
  // ── Identity ──
  generateKeys(): Promise<{ publicKey: string; agentId: string }>;
  register(name: string, opts?: { description?: string; capabilities?: Record<string, unknown> }): Promise<AgentInfo>;
  getMe(): Promise<AgentInfo>;
  getAgentId(): Promise<string | null>;

  // ── Products ──
  searchProducts(opts?: { keyword?: string; category?: string; minPrice?: number; maxPrice?: number; page?: number; limit?: number }): Promise<{ products: Product[]; pagination: PaginatedResponse<Product>['pagination'] }>;
  getProduct(productId: string): Promise<Product>;
  listCategories(): Promise<string[]>;
  getNewArrivals(opts?: { days?: number; page?: number; limit?: number }): Promise<{ products: Product[]; pagination: PaginatedResponse<Product>['pagination'] }>;

  // ── Watchlist ──
  watchProduct(productId: string, notifyOn?: Record<string, boolean>): Promise<unknown>;
  watchCategory(category: string, notifyOn?: Record<string, boolean>): Promise<unknown>;
  unwatchItem(watchlistItemId: string): Promise<void>;
  getWatchlist(opts?: { page?: number; limit?: number }): Promise<{ watchlist: unknown[]; pagination: PaginatedResponse<unknown>['pagination'] }>;
  getWatchlistUpdates(): Promise<unknown[]>;

  // ── Orders ──
  createOrder(items: Array<{ productId: string; quantity: number }>, shippingAddress?: Record<string, unknown>): Promise<Order>;
  payOrder(orderId: string, txHash: string, chain?: string): Promise<Order>;
  getOrder(orderId: string): Promise<Order>;
  listOrders(opts?: { status?: string; page?: number; limit?: number }): Promise<{ orders: Order[]; pagination: PaginatedResponse<Order>['pagination'] }>;

  // ── Wallets ──
  registerWallet(walletAddress: string, opts?: { chain?: string; label?: string }): Promise<Wallet>;
  listWallets(): Promise<Wallet[]>;

  // ── Dashboard ──
  generateDashboardToken(): Promise<DashboardToken>;
}

/**
 * Create a CoolBuy client for agent use.
 */
export function createCoolBuyClient(config: CoolBuyClientConfig = {}): CoolBuyClient {
  const keyStore: KeyStore = config.keyStore ?? new MemoryKeyStore();
  const http = new HttpClient(
    config.baseUrl ?? DEFAULT_BASE_URL,
    keyStore,
    config.requestTimeoutMs,
  );

  return {
    // ── Identity ──

    async generateKeys() {
      const kp = generateKeyPair();
      await keyStore.store(kp.privateKeyDer, kp.publicKey, kp.agentId);
      return { publicKey: kp.publicKey, agentId: kp.agentId };
    },

    async register(name, opts = {}) {
      const publicKey = await keyStore.getPublicKey();
      if (!publicKey) throw new Error('Generate keys first');

      const res = await http.request<ApiResponse<AgentInfo>>({
        method: 'POST',
        path: '/agents/register',
        body: {
          public_key: publicKey,
          name,
          description: opts.description,
          capabilities: opts.capabilities,
        },
        auth: false,
      });
      return res.data!;
    },

    async getMe() {
      const res = await http.request<ApiResponse<AgentInfo>>({
        method: 'GET',
        path: '/agents/me/profile',
      });
      return res.data!;
    },

    async getAgentId() {
      return keyStore.getAgentId();
    },

    // ── Products ──

    async searchProducts(opts = {}) {
      const res = await http.request<{ success: boolean; products: Product[]; pagination: PaginatedResponse<Product>['pagination'] }>({
        method: 'GET',
        path: '/products/search',
        query: {
          keyword: opts.keyword,
          category: opts.category,
          min_price: opts.minPrice,
          max_price: opts.maxPrice,
          page: opts.page,
          limit: opts.limit,
        },
      });
      return { products: res.products ?? [], pagination: res.pagination };
    },

    async getProduct(productId) {
      const res = await http.request<ApiResponse<Product>>({
        method: 'GET',
        path: `/products/${productId}`,
      });
      return res.data!;
    },

    async listCategories() {
      const res = await http.request<ApiResponse<string[]>>({
        method: 'GET',
        path: '/products/categories',
      });
      return res.data!;
    },

    async getNewArrivals(opts = {}) {
      const res = await http.request<{ success: boolean; products: Product[]; pagination: PaginatedResponse<Product>['pagination'] }>({
        method: 'GET',
        path: '/products/new-arrivals',
        query: { days: opts.days, page: opts.page, limit: opts.limit },
      });
      return { products: res.products ?? [], pagination: res.pagination };
    },

    // ── Watchlist ──

    async watchProduct(productId, notifyOn) {
      const res = await http.request<ApiResponse<unknown>>({
        method: 'POST',
        path: '/watchlist',
        body: { target_type: 'product', target_id: productId, notify_on: notifyOn },
      });
      return res.data!;
    },

    async watchCategory(category, notifyOn) {
      const res = await http.request<ApiResponse<unknown>>({
        method: 'POST',
        path: '/watchlist',
        body: { target_type: 'category', target_id: category, notify_on: notifyOn },
      });
      return res.data!;
    },

    async unwatchItem(watchlistItemId) {
      await http.request({ method: 'DELETE', path: `/watchlist/${watchlistItemId}` });
    },

    async getWatchlist(opts = {}) {
      const res = await http.request<{ success: boolean; watchlist: unknown[]; pagination: PaginatedResponse<unknown>['pagination'] }>({
        method: 'GET',
        path: '/watchlist',
        query: { page: opts.page, limit: opts.limit },
      });
      return { watchlist: res.watchlist ?? [], pagination: res.pagination };
    },

    async getWatchlistUpdates() {
      const res = await http.request<ApiResponse<unknown[]>>({
        method: 'GET',
        path: '/watchlist/updates',
      });
      return res.data!;
    },

    // ── Orders ──

    async createOrder(items, shippingAddress) {
      const res = await http.request<ApiResponse<Order>>({
        method: 'POST',
        path: '/orders',
        body: { items, shipping_address: shippingAddress },
      });
      return res.data!;
    },

    async payOrder(orderId, txHash, chain) {
      const res = await http.request<ApiResponse<Order>>({
        method: 'POST',
        path: `/orders/${orderId}/pay`,
        body: { tx_hash: txHash, chain },
      });
      return res.data!;
    },

    async getOrder(orderId) {
      const res = await http.request<ApiResponse<Order>>({
        method: 'GET',
        path: `/orders/${orderId}`,
      });
      return res.data!;
    },

    async listOrders(opts = {}) {
      const res = await http.request<{ success: boolean; orders: Order[]; pagination: PaginatedResponse<Order>['pagination'] }>({
        method: 'GET',
        path: '/orders',
        query: {
          status: opts.status,
          page: opts.page,
          limit: opts.limit,
        },
      });
      return { orders: res.orders ?? [], pagination: res.pagination };
    },

    // ── Wallets ──

    async registerWallet(walletAddress, opts = {}) {
      const res = await http.request<ApiResponse<Wallet>>({
        method: 'POST',
        path: '/wallets',
        body: {
          wallet_address: walletAddress,
          chain: opts.chain,
          label: opts.label,
        },
      });
      return res.data!;
    },

    async listWallets() {
      const res = await http.request<ApiResponse<Wallet[]>>({
        method: 'GET',
        path: '/wallets',
      });
      return res.data!;
    },

    // ── Dashboard ──

    async generateDashboardToken() {
      const res = await http.request<ApiResponse<DashboardToken>>({
        method: 'POST',
        path: '/observe/token',
        body: {},
      });
      return res.data!;
    },
  };
}
