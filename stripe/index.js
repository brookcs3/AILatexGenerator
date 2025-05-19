export default class Stripe {
  constructor() {}
  prices = {
    async retrieve(id) {
      return {
        nickname: 'Test Price',
        unit_amount: 1000,
        currency: 'usd',
        tax_behavior: 'inclusive',
        recurring: { interval: 'month' },
        product: 'prod_123'
      };
    }
  };
  products = {
    async retrieve(id) {
      return { name: 'Test Product', tax_code: 'txcd_10000000' };
    }
  };
  checkout = {
    sessions: {
      async create(opts) {
        return { id: 'cs_test', url: 'https://example.com/test-session' };
      }
    }
  };
}
