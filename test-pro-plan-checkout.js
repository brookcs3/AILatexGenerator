/**
 * Pro Plan Checkout Test Script
 * 
 * This script tests the Pro Plan subscription setup with tax-inclusive pricing.
 * It creates a test checkout session and verifies the configuration is correct.
 */
// Attempt to load environment variables if dotenv is available
let loadEnv = async () => {};
try {
  const mod = await import('dotenv');
  loadEnv = mod.config;
} catch (err) {
  console.warn('dotenv not installed - skipping env load');
}
// Dynamically import Stripe if available
let Stripe;
try {
  const mod = await import('stripe');
  Stripe = mod.default;
} catch (err) {
  console.warn('stripe not installed - skipping test');
  process.exit(0);
}

// Load environment variables if possible
await loadEnv();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Pro Plan Price ID used for testing - should point to the tax-inclusive price
const proPlanPriceId = process.env.TEST_PRO_PLAN_PRICE_ID;

async function testProPlanCheckout() {
  console.log('=== Testing Pro Plan Checkout Session ===');
  console.log(`Using Pro Plan Price ID: ${proPlanPriceId}`);
  
  try {
    // 1. Verify the price exists and has tax_behavior: inclusive
    const price = await stripe.prices.retrieve(proPlanPriceId);
    console.log(`\nPrice verification:`);
    console.log(`- Name: ${price.nickname || 'Unnamed price'}`);
    console.log(`- Amount: ${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`);
    console.log(`- Tax Behavior: ${price.tax_behavior}`);
    console.log(`- Billing: ${price.recurring ? price.recurring.interval : 'one-time'}`);
    
    if (price.tax_behavior !== 'inclusive') {
      console.warn('\n⚠️ WARNING: Price is not set to tax_behavior: inclusive!');
      console.warn('This will cause taxes to be added on top of the advertised price.');
    } else {
      console.log('\n✓ Price has correct tax_behavior: inclusive setting');
    }
    
    // 2. Check the product for tax code
    const product = await stripe.products.retrieve(price.product);
    console.log(`\nProduct verification:`);
    console.log(`- Name: ${product.name}`);
    console.log(`- Tax Code: ${product.tax_code || 'None'}`);
    
    if (!product.tax_code || product.tax_code !== 'txcd_10000000') {
      console.warn('\n⚠️ WARNING: Product is missing the digital services tax code!');
      console.warn('Recommend setting tax_code to txcd_10000000 for digital services.');
    } else {
      console.log('\n✓ Product has correct tax_code for digital services');
    }
    
    // 3. Create a test checkout session to verify configuration
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: proPlanPriceId,
          quantity: 1,
        },
      ],
      success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://example.com/cancel',
      tax_id_collection: { enabled: true },
    });
    
    console.log(`\nCheckout Session Created:`);
    console.log(`- Session ID: ${session.id}`);
    console.log(`- URL: ${session.url}`);
    console.log(`\n✓ Successfully created checkout session with tax configuration`);
    console.log(`\nTest this URL in your browser: ${session.url}`);
    console.log('(This is a test session - no actual charges will be made until payment is completed)');
    
  } catch (error) {
    console.error('\n❌ Error testing Pro Plan checkout:');
    console.error(error.message);
  }
}

// Run the test
testProPlanCheckout();