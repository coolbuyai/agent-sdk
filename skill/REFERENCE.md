---
name: coolbuy-reference
description: Complete API endpoint reference for CoolBuy
---

# API Reference

Base URL: `https://api.coolbuy.ai/api/v1` (configurable via `COOLBUY_API_URL` env var)

## Authentication

All protected endpoints require Ed25519 signature headers:

| Header | Description |
|--------|-------------|
| `X-Claw-Agent-ID` | Agent unique identifier (16-char hex) |
| `X-Claw-Signature` | Ed25519 signature (base64) |
| `X-Claw-Nonce` | UUID v4 (unique per request) |
| `X-Claw-Timestamp` | Unix timestamp in seconds |

Signature message format: `JSON.stringify(body) + nonce + timestamp`

## Endpoints

### Agents

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/agents/register` | No | Register new agent |
| GET | `/agents` | No | List all active agents |
| GET | `/agents/:agentId` | No | Get agent by ID |
| GET | `/agents/me/profile` | Yes | Get current agent profile |

### Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products/search` | Yes | Search products |
| GET | `/products/categories` | Yes | List categories |
| GET | `/products/new-arrivals` | Yes | New arrivals (query: `days`, `page`, `limit`) |
| GET | `/products/:id` | Yes | Get product details |

**Search query params:** `keyword`, `category`, `min_price`, `max_price`, `page`, `limit`

### Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | Yes | Create order |
| GET | `/orders` | Yes | List agent's orders |
| GET | `/orders/:id` | Yes | Get order details |
| POST | `/orders/:id/pay` | Yes | Pay for order (USDC) |

### Wallets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/wallets` | Yes | Register wallet |
| GET | `/wallets` | Yes | List wallets |

### Watchlist

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/watchlist` | Yes | Watch a product or category |
| GET | `/watchlist` | Yes | List watchlist items |
| GET | `/watchlist/status` | Yes | Check watch status (query: `target_type`, `target_id`) |
| GET | `/watchlist/updates` | Yes | Get updates for watched items |
| DELETE | `/watchlist/:id` | Yes | Remove from watchlist |

**Watch body:** `{ "target_type": "product"|"category", "target_id": "<uuid or slug>", "notify_on": { "price_drop": true, "back_in_stock": true, "new_arrival": true } }`

### Dashboard (Observe)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/observe/token` | Agent | Generate share token |
| GET | `/observe/auth/:token` | No | Exchange compact token for JWT |
| GET | `/observe/agent` | Share JWT | Agent profile + stats |
| GET | `/observe/orders` | Share JWT | List orders |
| GET | `/observe/orders/:id` | Share JWT | Order details |
| GET | `/observe/wallets` | Share JWT | List wallets |
| GET | `/observe/watchlist` | Share JWT | List watchlist items |

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_MISSING_HEADERS` | Required X-Claw-* headers missing |
| `AUTH_INVALID_AGENT` | Agent not found |
| `AUTH_AGENT_SUSPENDED` | Agent suspended or revoked |
| `AUTH_INVALID_TIMESTAMP` | Timestamp outside 5-min window |
| `AUTH_NONCE_REPLAYED` | Nonce reuse detected |
| `AUTH_INVALID_SIG` | Signature verification failed |
