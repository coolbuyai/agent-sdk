import { generateKeyPair } from '../crypto/keys.js';
import { MemoryKeyStore } from '../store/index.js';
import { HttpClient } from './http.js';
const DEFAULT_BASE_URL = process.env.COOLBUY_API_URL || 'http://54.226.156.136:4000/api/v1';
/**
 * Create a CoolBuy client for agent use.
 */
export function createCoolBuyClient(config = {}) {
    const keyStore = config.keyStore ?? new MemoryKeyStore();
    const http = new HttpClient(config.baseUrl ?? DEFAULT_BASE_URL, keyStore, config.requestTimeoutMs);
    return {
        // ── Identity ──
        async generateKeys() {
            const kp = generateKeyPair();
            await keyStore.store(kp.privateKeyDer, kp.publicKey, kp.agentId);
            return { publicKey: kp.publicKey, agentId: kp.agentId };
        },
        async register(name, opts = {}) {
            const publicKey = await keyStore.getPublicKey();
            if (!publicKey)
                throw new Error('Generate keys first');
            const res = await http.request({
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
            return res.data;
        },
        async getMe() {
            const res = await http.request({
                method: 'GET',
                path: '/agents/me/profile',
            });
            return res.data;
        },
        async getAgentId() {
            return keyStore.getAgentId();
        },
        // ── Products ──
        async searchProducts(opts = {}) {
            const res = await http.request({
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
            const res = await http.request({
                method: 'GET',
                path: `/products/${productId}`,
            });
            return res.data;
        },
        async listCategories() {
            const res = await http.request({
                method: 'GET',
                path: '/products/categories',
            });
            return res.data;
        },
        async getNewArrivals(opts = {}) {
            const res = await http.request({
                method: 'GET',
                path: '/products/new-arrivals',
                query: { days: opts.days, page: opts.page, limit: opts.limit },
            });
            return { products: res.products ?? [], pagination: res.pagination };
        },
        // ── Watchlist ──
        async watchProduct(productId, notifyOn) {
            const res = await http.request({
                method: 'POST',
                path: '/watchlist',
                body: { target_type: 'product', target_id: productId, notify_on: notifyOn },
            });
            return res.data;
        },
        async watchCategory(category, notifyOn) {
            const res = await http.request({
                method: 'POST',
                path: '/watchlist',
                body: { target_type: 'category', target_id: category, notify_on: notifyOn },
            });
            return res.data;
        },
        async unwatchItem(watchlistItemId) {
            await http.request({ method: 'DELETE', path: `/watchlist/${watchlistItemId}` });
        },
        async getWatchlist(opts = {}) {
            const res = await http.request({
                method: 'GET',
                path: '/watchlist',
                query: { page: opts.page, limit: opts.limit },
            });
            return { watchlist: res.watchlist ?? [], pagination: res.pagination };
        },
        async getWatchlistUpdates() {
            const res = await http.request({
                method: 'GET',
                path: '/watchlist/updates',
            });
            return res.data;
        },
        // ── Orders ──
        async createOrder(items, shippingAddress) {
            const res = await http.request({
                method: 'POST',
                path: '/orders',
                body: { items, shipping_address: shippingAddress },
            });
            return res.data;
        },
        async payOrder(orderId, txHash, chain) {
            const res = await http.request({
                method: 'POST',
                path: `/orders/${orderId}/pay`,
                body: { tx_hash: txHash, chain },
            });
            return res.data;
        },
        async getOrder(orderId) {
            const res = await http.request({
                method: 'GET',
                path: `/orders/${orderId}`,
            });
            return res.data;
        },
        async listOrders(opts = {}) {
            const res = await http.request({
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
            const res = await http.request({
                method: 'POST',
                path: '/wallets',
                body: {
                    wallet_address: walletAddress,
                    chain: opts.chain,
                    label: opts.label,
                },
            });
            return res.data;
        },
        async listWallets() {
            const res = await http.request({
                method: 'GET',
                path: '/wallets',
            });
            return res.data;
        },
        // ── Dashboard ──
        async generateDashboardToken() {
            const res = await http.request({
                method: 'POST',
                path: '/observe/token',
                body: {},
            });
            return res.data;
        },
    };
}
//# sourceMappingURL=index.js.map