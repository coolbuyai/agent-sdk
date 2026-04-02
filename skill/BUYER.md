---
name: coolbuy-buyer
description: How to discover, purchase, and track Chinese products as an agent
---

# Buyer Guide

## Discovery

Search for products by keyword, category, or price range:

```typescript
// Search by keyword (searches name, nameZh, description)
const { products } = await client.searchProducts({ keyword: 'drone' });

// Filter by category
const { products } = await client.searchProducts({ category: 'electronics' });

// Price range (USDC)
const { products } = await client.searchProducts({ minPrice: 50, maxPrice: 200 });

// List available categories
const categories = await client.listCategories();
// → ['electronics', 'fashion', 'home', 'food', 'art']

// Get product details
const product = await client.getProduct(productId);

// Each product includes:
// - product.coolbuyUrl  → CoolBuy product page (shareable with user)
// - product.productUrl  → Supplier/brand website link
// - product.imageUrl    → Product image
```

**IMPORTANT:** When showing search results to the user, always include `coolbuyUrl` so they can click to view the product page on CoolBuy.

## Purchasing

```typescript
// Create order with one or more items
const order = await client.createOrder([
  { productId: 'uuid-1', quantity: 2 },
  { productId: 'uuid-2', quantity: 1 },
], {
  name: 'John Doe',
  country: 'US',
  state: 'CA',
  city: 'San Francisco',
  address: '123 Market St',
  zip: '94105',
  phone: '+1-555-0123',
});

console.log(`Order ${order.orderNumber} created: $${order.totalUsdc} USDC`);
```

## Payment (USDC)

After creating an order, pay with USDC on Sepolia testnet:

1. Register your wallet: `await client.registerWallet('0xYourAddress')`
2. Transfer USDC on-chain to the platform wallet
3. Submit tx hash: `await client.payOrder(order.id, '0xTxHash')`

```typescript
// Register wallet
await client.registerWallet('0x1234...abcd', { chain: 'sepolia', label: 'primary' });

// After on-chain USDC transfer:
const paid = await client.payOrder(order.id, '0xabc123...def');
console.log('Payment status:', paid.paymentStatus); // 'paid'
```

## Order Tracking

```typescript
// List all orders
const { orders } = await client.listOrders();

// Filter by status
const { orders: shipped } = await client.listOrders({ status: 'shipped' });

// Get order details with tracking
const order = await client.getOrder(orderId);
console.log('Status:', order.status);
console.log('Tracking:', order.trackingInfo);
```

## Dashboard for Humans

Generate a dashboard link for the human to view order status:

```typescript
const { dashboard_url } = await client.generateDashboardToken();
// Send this URL to the human
// They can see: agent profile, all orders, payment status, tracking info
```

## Best Practices

1. **Compare before buying** — search with different keywords to find the best deal
2. **Check stock** — verify `product.stock > 0` before ordering
3. **Save dashboard URL** — always share the dashboard link with the human
4. **Track proactively** — periodically check order status and report updates
