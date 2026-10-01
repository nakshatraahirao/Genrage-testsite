import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting API Verification Tests...');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(healthRes.status, 200, 'Health check should return 200');
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok', 'Status should be ok');
  console.log('✅ Health check passed');

  // 2. Fetch products
  const productsRes = await fetch(`${BASE_URL}/products`);
  assert.strictEqual(productsRes.status, 200, 'Products endpoint should return 200');
  const productsData = await productsRes.json();
  assert.ok(productsData.products.length >= 20, 'Should have at least 20 seeded products');
  console.log(`✅ Products list passed: ${productsData.products.length} products loaded`);

  // 3. Filter products by category
  const basicsRes = await fetch(`${BASE_URL}/products?category=basics`);
  const basicsData = await basicsRes.json();
  assert.ok(basicsData.products.length >= 4, 'Should find basics products');
  console.log(`✅ Category filter passed: ${basicsData.products.length} basics products found`);

  // 4. Product detail by slug
  const productDetailRes = await fetch(`${BASE_URL}/products/basic-black-baggy-pants`);
  assert.strictEqual(productDetailRes.status, 200, 'Single product should return 200');
  const { product, relatedProducts } = await productDetailRes.json();
  assert.strictEqual(product.name, 'BASIC BLACK BAGGY PANTS');
  assert.ok(product.variants.length > 0, 'Product should have variants');
  console.log('✅ Product detail endpoint passed');

  // 5. Customer Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@genrage.com', password: 'customer123' })
  });
  assert.strictEqual(loginRes.status, 200, 'Customer login should succeed');
  const loginData = await loginRes.json();
  const customerToken = loginData.token;
  assert.ok(customerToken, 'Customer should receive JWT token');
  console.log('✅ Customer login passed');

  // 6. Admin Login
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@genrage.com', password: 'admin123' })
  });
  assert.strictEqual(adminLoginRes.status, 200, 'Admin login should succeed');
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.token;
  assert.strictEqual(adminData.user.role, 'ADMIN', 'Admin user must have ADMIN role');
  console.log('✅ Admin login passed');

  // 7. Add to Cart
  const firstVariant = product.variants[0];
  const addToCartRes = await fetch(`${BASE_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({ productId: product.id, variantId: firstVariant.id, quantity: 1 })
  });
  assert.strictEqual(addToCartRes.status, 201, 'Add to cart should return 201');
  console.log('✅ Add to cart passed');

  // 8. View Cart
  const cartRes = await fetch(`${BASE_URL}/cart`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  assert.strictEqual(cartRes.status, 200, 'Get cart should return 200');
  const cartData = await cartRes.json();
  assert.ok(cartData.items.length > 0, 'Cart should contain items');
  console.log(`✅ View cart passed: ${cartData.items.length} items in cart, total: ₹${cartData.summary.total}`);

  // 9. Checkout / Create Order
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      paymentMethod: 'UPI',
      shippingAddress: {
        fullName: 'Rager Karan',
        phone: '+91 99887 76655',
        street: 'Flat 402, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050'
      }
    })
  });
  assert.strictEqual(orderRes.status, 201, 'Order placement should return 201');
  const orderData = await orderRes.json();
  assert.ok(orderData.order.orderNumber, 'Order should have orderNumber');
  console.log(`✅ Order checkout passed: Order #${orderData.order.orderNumber} created`);

  // 10. Admin Metrics
  const metricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(metricsRes.status, 200, 'Admin metrics should return 200');
  const metricsData = await metricsRes.json();
  assert.ok(metricsData.metrics.totalOrders >= 2, 'Admin should see updated order counts');
  console.log(`✅ Admin metrics passed: ${metricsData.metrics.totalOrders} total orders, ₹${metricsData.metrics.totalRevenue} revenue`);

  console.log('\n🎉 ALL 10 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
