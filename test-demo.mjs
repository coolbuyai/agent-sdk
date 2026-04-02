/**
 * CoolBuy Agent SDK - End-to-end demo test
 * Tests: register → search → watchlist → order → pay → dashboard token
 */
import { createCoolBuyClient, MemoryKeyStore } from './dist/index.js';

const client = createCoolBuyClient({
  baseUrl: 'http://localhost:4000/api/v1',
  keyStore: new MemoryKeyStore(),
});

async function main() {
  console.log('=== CoolBuy Agent SDK Demo ===\n');

  // 1. Generate keys & register
  console.log('1. Generating Ed25519 keys...');
  const { publicKey, agentId } = await client.generateKeys();
  console.log(`   Public Key: ${publicKey.substring(0, 16)}...`);
  console.log(`   Agent ID: ${agentId}\n`);

  console.log('2. Registering agent...');
  const suffix = Math.random().toString(36).substring(7);
  const agent = await client.register(`demo-agent-${suffix}`, {
    description: 'Demo agent for testing CoolBuy',
    capabilities: { seeks: ['electronics', 'tea', 'fashion'] },
  });
  console.log(`   Registered: ${agent.name} (status: ${agent.status})\n`);

  // 2. Get profile
  console.log('3. Fetching profile...');
  const me = await client.getMe();
  console.log(`   Name: ${me.name}, ID: ${me.agentId}\n`);

  // 3. Search products
  console.log('4. Searching products...');
  const { products } = await client.searchProducts({ keyword: 'tea' });
  console.log(`   Found ${products.length} products:`);
  for (const p of products) {
    console.log(`   - ${p.name} (${p.nameZh}) $${p.priceUsdc} USDC`);
  }
  console.log();

  // 4. List categories
  console.log('5. Listing categories...');
  const categories = await client.listCategories();
  console.log(`   Categories: ${categories.join(', ')}\n`);

  // 5. New arrivals
  console.log('6. Checking new arrivals (last 30 days)...');
  const { products: newArrivals } = await client.getNewArrivals({ days: 30 });
  console.log(`   ${newArrivals.length} new arrivals found\n`);

  // 6. Watchlist - watch a product
  console.log('7. Adding products to watchlist...');
  const teaProduct = products[0];
  const watchItem = await client.watchProduct(teaProduct.id);
  console.log(`   Watching: ${teaProduct.name}`);

  // Watch a category
  await client.watchCategory('electronics');
  console.log(`   Watching category: electronics`);

  // Get watchlist
  const { watchlist } = await client.getWatchlist();
  console.log(`   Watchlist items: ${watchlist.length}\n`);

  // Check for updates
  console.log('8. Checking watchlist updates...');
  const updates = await client.getWatchlistUpdates();
  console.log(`   ${updates.length} update(s) found`);
  for (const u of updates) {
    console.log(`   - [${u.type}] ${u.message}`);
  }
  console.log();

  // 7. Search electronics and order
  console.log('9. Searching electronics...');
  const { products: electronics } = await client.searchProducts({ category: 'electronics' });
  console.log(`   Found ${electronics.length} electronics\n`);

  // 8. Create order
  console.log('10. Creating order...');
  const firstProduct = electronics[0];
  const order = await client.createOrder(
    [{ productId: firstProduct.id, quantity: 1 }],
    { name: 'Test User', country: 'US', city: 'SF', address: '123 Main St' }
  );
  console.log(`   Order: ${order.orderNumber}`);
  console.log(`   Total: $${order.totalUsdc} USDC`);
  console.log(`   Status: ${order.status}, Payment: ${order.paymentStatus}\n`);

  // 9. Register wallet (Sepolia)
  console.log('11. Registering wallet (Sepolia)...');
  const wallet = await client.registerWallet('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', { chain: 'sepolia' });
  console.log(`   Wallet: ${wallet.walletAddress} (${wallet.chain})\n`);

  // 10. Pay order with USDC on Sepolia
  console.log('12. Paying order with USDC on Sepolia...');
  const paid = await client.payOrder(order.id, '0xdemo_sepolia_tx_hash_abc123', 'sepolia');
  console.log(`   Payment: ${paid.paymentStatus}`);
  console.log(`   TX Hash: ${paid.paymentTxHash}`);
  console.log(`   Chain: ${paid.paymentChain}`);
  console.log(`   Order Status: ${paid.status}\n`);

  // 11. List orders
  console.log('13. Listing orders...');
  const { orders } = await client.listOrders();
  console.log(`   Total orders: ${orders.length}`);
  for (const o of orders) {
    console.log(`   - ${o.orderNumber}: ${o.status} ($${o.totalUsdc} USDC)`);
  }
  console.log();

  // 12. Generate dashboard token
  console.log('14. Generating dashboard token for human...');
  const dashboard = await client.generateDashboardToken();
  console.log(`   Dashboard URL: ${dashboard.dashboard_url}`);
  console.log(`   Expires in: ${dashboard.expires_in}\n`);

  // 13. Remove from watchlist
  console.log('15. Removing tea from watchlist...');
  await client.unwatchItem(watchItem.id);
  const { watchlist: remaining } = await client.getWatchlist();
  console.log(`   Remaining watchlist items: ${remaining.length}\n`);

  console.log('=== All tests passed! ===');
}

main().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
