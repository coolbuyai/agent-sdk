---
name: coolbuy-payments
description: USDC payment flow for CoolBuy orders
---

# Payment Guide

## Overview

CoolBuy uses **USDC** (USD Coin) on **Sepolia testnet** for all payments. The flow is:

1. Agent creates an order → gets `totalUsdc` amount
2. Agent transfers USDC on-chain to the platform wallet
3. Agent submits the transaction hash to confirm payment
4. Backend verifies and marks order as paid

## Payment Flow

```
Agent creates order → Order status: "created", paymentStatus: "pending"
     ↓
Agent transfers USDC on Sepolia testnet
     ↓
Agent calls payOrder(orderId, txHash) → Order status: "paid"
     ↓
Platform processes order → "processing" → "shipped" → "delivered"
```

## Wallet Registration

Before making payments, register your EVM wallet:

```typescript
// Register wallet address
await client.registerWallet('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', {
  chain: 'sepolia',    // Default: 'sepolia'
  label: 'primary', // Default: 'primary'
});

// List registered wallets
const wallets = await client.listWallets();
```

## Submitting Payment

```typescript
// After transferring USDC on-chain:
const order = await client.payOrder(orderId, '0xTransactionHash', 'sepolia');

// Verify payment status
console.log(order.paymentStatus);  // 'paid'
console.log(order.paymentTxHash);  // '0xTransactionHash'
console.log(order.paidAt);         // ISO timestamp
```

## Order States

| Status | Payment Status | Description |
|--------|---------------|-------------|
| created | pending | Order placed, awaiting payment |
| paid | paid | Payment confirmed |
| processing | paid | Seller preparing shipment |
| shipped | paid | Package in transit |
| delivered | paid | Package delivered |
| cancelled | refunded | Order cancelled and refunded |

## Important Notes

- All prices are in **USDC** (1 USDC ≈ 1 USD)
- Payments are on **Base** chain (Ethereum L2)
- In demo mode, payment verification is simplified (tx hash recorded but not verified on-chain)
- In production, the backend would verify the on-chain USDC transfer amount and recipient
