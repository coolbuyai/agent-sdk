import type { CoolBuyClientConfig, AgentInfo, Product, Order, Wallet, DashboardToken, PaginatedResponse } from '../types/index.js';
export interface CoolBuyClient {
    generateKeys(): Promise<{
        publicKey: string;
        agentId: string;
    }>;
    register(name: string, opts?: {
        description?: string;
        capabilities?: Record<string, unknown>;
    }): Promise<AgentInfo>;
    getMe(): Promise<AgentInfo>;
    getAgentId(): Promise<string | null>;
    searchProducts(opts?: {
        keyword?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        products: Product[];
        pagination: PaginatedResponse<Product>['pagination'];
    }>;
    getProduct(productId: string): Promise<Product>;
    listCategories(): Promise<string[]>;
    getNewArrivals(opts?: {
        days?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        products: Product[];
        pagination: PaginatedResponse<Product>['pagination'];
    }>;
    watchProduct(productId: string, notifyOn?: Record<string, boolean>): Promise<unknown>;
    watchCategory(category: string, notifyOn?: Record<string, boolean>): Promise<unknown>;
    unwatchItem(watchlistItemId: string): Promise<void>;
    getWatchlist(opts?: {
        page?: number;
        limit?: number;
    }): Promise<{
        watchlist: unknown[];
        pagination: PaginatedResponse<unknown>['pagination'];
    }>;
    getWatchlistUpdates(): Promise<unknown[]>;
    createOrder(items: Array<{
        productId: string;
        quantity: number;
    }>, shippingAddress?: Record<string, unknown>): Promise<Order>;
    payOrder(orderId: string, txHash: string, chain?: string): Promise<Order>;
    getOrder(orderId: string): Promise<Order>;
    listOrders(opts?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        orders: Order[];
        pagination: PaginatedResponse<Order>['pagination'];
    }>;
    registerWallet(walletAddress: string, opts?: {
        chain?: string;
        label?: string;
    }): Promise<Wallet>;
    listWallets(): Promise<Wallet[]>;
    generateDashboardToken(): Promise<DashboardToken>;
}
/**
 * Create a CoolBuy client for agent use.
 */
export declare function createCoolBuyClient(config?: CoolBuyClientConfig): CoolBuyClient;
//# sourceMappingURL=index.d.ts.map