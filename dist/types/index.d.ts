export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error_code?: string;
}
export interface PaginatedResponse<T> {
    success: boolean;
    products?: T[];
    orders?: T[];
    agents?: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export interface AgentInfo {
    id: string;
    agentId: string;
    name: string;
    description?: string;
    capabilities?: Record<string, unknown>;
    status: string;
    createdAt?: string;
}
export interface Product {
    id: string;
    name: string;
    nameZh?: string;
    description?: string;
    category: string;
    priceUsdc: number;
    priceCny?: number;
    imageUrl?: string;
    supplier?: string;
    stock: number;
    metadata?: Record<string, unknown>;
    status: string;
}
export interface OrderItem {
    productId: string;
    name: string;
    nameZh?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface Order {
    id: string;
    orderNumber: string;
    agentId: string;
    items: OrderItem[];
    totalUsdc: number;
    shippingAddress?: Record<string, unknown>;
    paymentStatus: string;
    paymentTxHash?: string;
    paymentChain?: string;
    paidAt?: string;
    status: string;
    trackingNumber?: string;
    trackingInfo?: Array<{
        timestamp: string;
        status: string;
        message: string;
    }>;
    createdAt?: string;
}
export interface Wallet {
    id: string;
    agentId: string;
    chain: string;
    walletAddress: string;
    label: string;
    status: string;
}
export interface DashboardToken {
    token: string;
    compact_token: string;
    dashboard_url: string;
    expires_in: string;
}
export interface CoolBuyClientConfig {
    baseUrl?: string;
    keyStore?: import('../store/index.js').KeyStore;
    requestTimeoutMs?: number;
}
//# sourceMappingURL=index.d.ts.map