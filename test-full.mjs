/**
 * CoolBuy Agent SDK - Full Test Suite
 * Covers: auth, search (keyword/category/price/combo), product detail,
 * new arrivals, watchlist, order lifecycle, wallet, payment, dashboard
 */
import { createCoolBuyClient, MemoryKeyStore } from './dist/index.js';

const client = createCoolBuyClient({
  baseUrl: 'http://localhost:4000/api/v1',
  keyStore: new MemoryKeyStore(),
});

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`   ✓ ${msg}`);
    passed++;
  } else {
    console.log(`   ✗ FAIL: ${msg}`);
    failed++;
  }
}

async function main() {
  console.log('══════════════════════════════════════════');
  console.log('  CoolBuy Agent SDK - Full Test Suite');
  console.log('══════════════════════════════════════════\n');

  // ── 1. Agent Identity ──
  console.log('── 1. Agent Identity ──');

  const { publicKey, agentId } = await client.generateKeys();
  assert(publicKey.length === 64, `Key generated: ${publicKey.substring(0, 12)}...`);
  assert(agentId.length === 16, `Agent ID: ${agentId}`);

  const suffix = Math.random().toString(36).substring(2, 8);
  const agent = await client.register(`test-agent-${suffix}`, {
    description: 'Full test suite agent',
    capabilities: { seeks: ['fashion', 'electronics'] },
  });
  assert(agent.status === 'active', `Registered: ${agent.name}`);

  const me = await client.getMe();
  assert(me.agentId === agentId, `Profile matches: ${me.name}`);

  // Duplicate registration should fail (same public key)
  try {
    await client.register(`test-agent-${suffix}-dup`, {});
    assert(false, 'Duplicate key should fail');
  } catch (e) {
    assert(e.message.includes('already registered') || e.message.includes('already taken'), 'Duplicate registration rejected');
  }
  console.log();

  // ── 2. Product Search ──
  console.log('── 2. Product Search ──');

  // 2a. Search all
  const { products: all } = await client.searchProducts({});
  assert(all.length > 0, `All products: ${all.length} found`);

  // 2b. Keyword search - English
  const { products: cashmere } = await client.searchProducts({ keyword: 'cashmere' });
  assert(cashmere.length > 0, `Keyword "cashmere": ${cashmere.length} results`);
  assert(cashmere.every(p =>
    p.name.toLowerCase().includes('cashmere') ||
    p.description?.toLowerCase().includes('cashmere')
  ), 'All results contain "cashmere"');

  // 2c. Keyword search - Chinese
  const { products: zhSearch } = await client.searchProducts({ keyword: '羊绒' });
  assert(zhSearch.length > 0, `Keyword "羊绒": ${zhSearch.length} results`);

  // 2d. Keyword search - brand
  const { products: jnby } = await client.searchProducts({ keyword: 'JNBY' });
  assert(jnby.length > 0, `Keyword "JNBY": ${jnby.length} results`);

  // 2e. Keyword search - no results
  const { products: none } = await client.searchProducts({ keyword: 'xyznonexistent' });
  assert(none.length === 0, 'Non-existent keyword: 0 results');

  // 2f. Category search
  const { products: fashion } = await client.searchProducts({ category: 'fashion' });
  assert(fashion.length > 0, `Category "fashion": ${fashion.length} results`);
  assert(fashion.every(p => p.category === 'fashion'), 'All fashion results have correct category');

  const { products: electronics } = await client.searchProducts({ category: 'electronics' });
  assert(electronics.length > 0, `Category "electronics": ${electronics.length} results`);

  const { products: food } = await client.searchProducts({ category: 'food' });
  assert(food.length > 0, `Category "food": ${food.length} results`);

  // 2g. Price range
  const { products: cheap } = await client.searchProducts({ maxPrice: 100 });
  assert(cheap.length > 0, `Under $100: ${cheap.length} results`);
  assert(cheap.every(p => parseFloat(p.priceUsdc) <= 100), 'All under $100');

  const { products: luxury } = await client.searchProducts({ minPrice: 500 });
  assert(luxury.length > 0, `Over $500: ${luxury.length} results`);
  assert(luxury.every(p => parseFloat(p.priceUsdc) >= 500), 'All over $500');

  const { products: midRange } = await client.searchProducts({ minPrice: 200, maxPrice: 500 });
  assert(midRange.length > 0, `$200-$500: ${midRange.length} results`);
  assert(midRange.every(p => parseFloat(p.priceUsdc) >= 200 && parseFloat(p.priceUsdc) <= 500), 'All in range $200-$500');

  // 2h. Combo: category + keyword
  const { products: fashionSilk } = await client.searchProducts({ category: 'fashion', keyword: 'silk' });
  assert(fashionSilk.length > 0, `Fashion + "silk": ${fashionSilk.length} results`);

  // 2i. Combo: category + price
  const { products: cheapFashion } = await client.searchProducts({ category: 'fashion', maxPrice: 200 });
  assert(cheapFashion.length > 0, `Fashion under $200: ${cheapFashion.length} results`);
  assert(cheapFashion.every(p => p.category === 'fashion' && parseFloat(p.priceUsdc) <= 200), 'All correct');

  // 2j. Pagination
  const { products: page1, pagination: pag1 } = await client.searchProducts({ limit: 3, page: 1 });
  assert(page1.length === 3, `Page 1 (limit 3): ${page1.length} results`);
  assert(pag1.total > 3, `Total: ${pag1.total}, totalPages: ${pag1.totalPages}`);

  const { products: page2 } = await client.searchProducts({ limit: 3, page: 2 });
  assert(page2.length > 0, `Page 2: ${page2.length} results`);
  assert(page1[0].id !== page2[0].id, 'Page 1 and 2 have different products');
  console.log();

  // ── 3. Product Detail ──
  console.log('── 3. Product Detail ──');

  const product = await client.getProduct(fashion[0].id);
  assert(product.id === fashion[0].id, `Got product: ${product.name}`);
  assert(product.nameZh !== undefined, `Chinese name: ${product.nameZh}`);
  assert(product.priceUsdc > 0, `Price: $${product.priceUsdc} USDC`);
  assert(product.stock >= 0, `Stock: ${product.stock}`);

  // Non-existent product
  try {
    await client.getProduct('00000000-0000-0000-0000-000000000000');
    assert(false, 'Non-existent product should 404');
  } catch (e) {
    assert(true, 'Non-existent product returns error');
  }
  console.log();

  // ── 4. Categories ──
  console.log('── 4. Categories ──');

  const categories = await client.listCategories();
  assert(categories.length >= 5, `Categories: ${categories.join(', ')}`);
  assert(categories.includes('fashion'), 'Includes "fashion"');
  assert(categories.includes('electronics'), 'Includes "electronics"');
  console.log();

  // ── 5. New Arrivals ──
  console.log('── 5. New Arrivals ──');

  const { products: arrivals30 } = await client.getNewArrivals({ days: 30 });
  assert(arrivals30.length > 0, `Last 30 days: ${arrivals30.length} arrivals`);

  const { products: arrivals1 } = await client.getNewArrivals({ days: 1 });
  assert(arrivals1.length <= arrivals30.length, `Last 1 day: ${arrivals1.length} arrivals`);
  console.log();

  // ── 6. Watchlist ──
  console.log('── 6. Watchlist ──');

  // Watch product
  const watchProduct = await client.watchProduct(fashion[0].id);
  assert(watchProduct.id, `Watching product: ${fashion[0].name}`);

  // Watch category
  const watchCat = await client.watchCategory('electronics');
  assert(watchCat.id, 'Watching category: electronics');

  // Duplicate watch should fail
  try {
    await client.watchProduct(fashion[0].id);
    assert(false, 'Duplicate watch should fail');
  } catch (e) {
    assert(e.message.includes('Already watching'), 'Duplicate watch rejected');
  }

  // Get watchlist
  const { watchlist } = await client.getWatchlist();
  assert(watchlist.length === 2, `Watchlist has ${watchlist.length} items`);

  const productWatch = watchlist.find(w => w.targetType === 'product');
  assert(productWatch?.product?.name, `Product watch enriched: ${productWatch?.product?.name}`);

  const catWatch = watchlist.find(w => w.targetType === 'category');
  assert(catWatch?.categoryInfo?.productCount > 0, `Category watch: ${catWatch?.categoryInfo?.productCount} products in electronics`);

  // Updates
  const updates = await client.getWatchlistUpdates();
  assert(updates.length > 0, `${updates.length} watchlist update(s)`);

  // Unwatch
  await client.unwatchItem(watchProduct.id);
  const { watchlist: afterRemove } = await client.getWatchlist();
  assert(afterRemove.length === 1, `After remove: ${afterRemove.length} item(s)`);

  // Watch non-existent product should fail
  try {
    await client.watchProduct('00000000-0000-0000-0000-000000000000');
    assert(false, 'Watching non-existent product should fail');
  } catch (e) {
    assert(true, 'Non-existent product watch rejected');
  }
  console.log();

  // ── 7. Order Lifecycle ──
  console.log('── 7. Order Lifecycle ──');

  // Create order
  const order = await client.createOrder(
    [
      { productId: fashion[0].id, quantity: 1 },
      { productId: electronics[0].id, quantity: 2 },
    ],
    { name: 'Test User', country: 'US', state: 'CA', city: 'San Francisco', address: '123 Market St', zip: '94105' }
  );
  assert(order.orderNumber.startsWith('CB-'), `Order created: ${order.orderNumber}`);
  assert(order.items.length === 2, `Items: ${order.items.length}`);
  assert(order.status === 'created', `Status: ${order.status}`);
  assert(order.paymentStatus === 'pending', `Payment: ${order.paymentStatus}`);
  assert(parseFloat(order.totalUsdc) > 0, `Total: $${order.totalUsdc} USDC`);

  // Get order
  const fetched = await client.getOrder(order.id);
  assert(fetched.orderNumber === order.orderNumber, `Fetched order: ${fetched.orderNumber}`);

  // List orders
  const { orders } = await client.listOrders();
  assert(orders.length >= 1, `Orders list: ${orders.length}`);

  // Empty items should fail
  try {
    await client.createOrder([], {});
    assert(false, 'Empty order should fail');
  } catch (e) {
    assert(true, 'Empty order rejected');
  }

  // Out of stock (order 9999 of something)
  try {
    await client.createOrder([{ productId: fashion[0].id, quantity: 9999 }]);
    assert(false, 'Insufficient stock should fail');
  } catch (e) {
    assert(e.message.includes('Insufficient stock'), 'Insufficient stock rejected');
  }
  console.log();

  // ── 8. Wallet ──
  console.log('── 8. Wallet ──');

  const wallet = await client.registerWallet('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', { chain: 'sepolia' });
  assert(wallet.walletAddress === '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', `Wallet: ${wallet.walletAddress}`);
  assert(wallet.chain === 'sepolia', `Chain: ${wallet.chain}`);

  const wallets = await client.listWallets();
  assert(wallets.length >= 1, `Wallets: ${wallets.length}`);

  // Duplicate wallet should fail
  try {
    await client.registerWallet('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', { chain: 'sepolia' });
    assert(false, 'Duplicate wallet should fail');
  } catch (e) {
    assert(e.message.includes('already registered'), 'Duplicate wallet rejected');
  }

  // Invalid address should fail
  try {
    await client.registerWallet('not-an-address');
    assert(false, 'Invalid address should fail');
  } catch (e) {
    assert(true, 'Invalid wallet address rejected');
  }
  console.log();

  // ── 9. Payment ──
  console.log('── 9. Payment (USDC on Sepolia) ──');

  const paid = await client.payOrder(order.id, '0xabc123def456789012345678901234567890abcdef', 'sepolia');
  assert(paid.paymentStatus === 'paid', `Payment status: ${paid.paymentStatus}`);
  assert(paid.paymentTxHash === '0xabc123def456789012345678901234567890abcdef', `TX hash recorded`);
  assert(paid.paymentChain === 'sepolia', `Chain: ${paid.paymentChain}`);
  assert(paid.status === 'paid', `Order status: ${paid.status}`);
  assert(paid.paidAt, `Paid at: ${paid.paidAt}`);

  // Double pay should fail
  try {
    await client.payOrder(order.id, '0xanother_tx_hash', 'sepolia');
    assert(false, 'Double payment should fail');
  } catch (e) {
    assert(e.message.includes('already paid'), 'Double payment rejected');
  }

  // Pay non-existent order
  try {
    await client.payOrder('00000000-0000-0000-0000-000000000000', '0xtx');
    assert(false, 'Paying non-existent order should fail');
  } catch (e) {
    assert(true, 'Non-existent order payment rejected');
  }
  console.log();

  // ── 10. Dashboard Token ──
  console.log('── 10. Dashboard (Observe) ──');

  const dashboard = await client.generateDashboardToken();
  assert(dashboard.token.length > 50, 'JWT token generated');
  assert(dashboard.compact_token.length === 48, `Compact token: ${dashboard.compact_token.substring(0, 16)}...`);
  assert(dashboard.dashboard_url.includes('/dashboard/auth?token='), `Dashboard URL valid`);
  assert(dashboard.expires_in === '7d', 'Expires in 7 days');
  console.log(`   Dashboard: ${dashboard.dashboard_url}`);
  console.log();

  // ── Summary ──
  console.log('══════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════');

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('\nFATAL:', err.message || err);
  process.exit(1);
});
