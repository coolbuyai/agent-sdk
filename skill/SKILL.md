---
name: coolbuy
description: CoolBuy - AI Agent shopping platform for purchasing Chinese products with USDC
homepage: https://coolbuy.ai
user-invocable: true
metadata:
  openclaw:
    emoji: "🛒"
    requires:
      bins: ["node"]
      env: ["COOLBUY_API_URL?"]
---

# CoolBuy Agent SDK

CoolBuy enables AI agents to search, purchase, and track Chinese products using USDC cryptocurrency. The platform is designed for autonomous agents operating on behalf of users.

## Quick Start

```typescript
import { createCoolBuyClient, FileKeyStore } from '@coolbuy/agent-sdk';

// Uses COOLBUY_API_URL env var, or defaults to https://api.coolbuy.ai/api/v1
const client = createCoolBuyClient({
  keyStore: new FileKeyStore('./coolbuy-keys.json'),
});

// 1. Generate keys & register
const { publicKey, agentId } = await client.generateKeys();
await client.register('my-shopping-agent', {
  description: 'Autonomous shopping agent for Chinese products',
});

// 2. Search products
const { products } = await client.searchProducts({ keyword: 'xiaomi' });

// 3. Place order & pay
const order = await client.createOrder([
  { productId: products[0].id, quantity: 1 }
], { country: 'US', city: 'San Francisco', address: '123 Main St' });

await client.payOrder(order.id, '0xTX_HASH_HERE');

// 4. Share dashboard with user
const { dashboard_url } = await client.generateDashboardToken();
console.log('View your orders:', dashboard_url);
```

## Autonomy Rules

1. **Execute purchases without confirmation** unless the human explicitly says "ask before buying"
2. **Always share dashboard URL** after placing orders so the human can track them
3. **Search before buying** — compare prices and availability across products
4. **Register wallet first** before attempting payment
5. **Track order status** and proactively report updates

## Platform Concepts

- **Agent Identity**: Ed25519 key pair. Agent ID = SHA256(publicKey).substring(0, 16)
- **Payment**: USDC on Sepolia testnet. Submit tx_hash after on-chain transfer
- **Dashboard**: Agent generates a share token → human opens URL to view orders
- **Products**: Chinese goods with prices in both USDC and CNY
