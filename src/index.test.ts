import { describe, it, expect } from 'vitest';
import { validateStripeApiKey } from './index.js';

describe('validateStripeApiKey', () => {
  it('有効なテストAPIキーを受け入れる', () => {
    expect(() => {
      validateStripeApiKey('sk_test_1234567890');
    }).not.toThrow();
  });

  it('"live"を含むが有効なテストAPIキーを受け入れる', () => {
    expect(() => {
      validateStripeApiKey('sk_test_for_live_stream');
    }).not.toThrow();

    expect(() => {
      validateStripeApiKey('sk_test_live_testing');
    }).not.toThrow();

    expect(() => {
      validateStripeApiKey('rk_test_live_testing');
    }).not.toThrow();
  });

  it('APIキーが未定義の場合、エラーを投げる', () => {
    expect(() => {
      validateStripeApiKey(undefined);
    }).toThrow('No Stripe secret key found');
  });

  it('APIキーが空文字列の場合、エラーを投げる', () => {
    expect(() => {
      validateStripeApiKey('');
    }).toThrow('No Stripe secret key found');
  });

  it('sk_live_形式のライブAPIキーを拒否する', () => {
    expect(() => {
      validateStripeApiKey('sk_live_1234567890');
    }).toThrow('You cannot use a live Stripe secret key for testing');
  });

  it('rk_live_形式のライブAPIキーを拒否する', () => {
    expect(() => {
      validateStripeApiKey('rk_live_1234567890');
    }).toThrow('You cannot use a live Stripe secret key for testing');
  });

  it('異なる形式のテストAPIキーを受け入れる', () => {
    expect(() => {
      validateStripeApiKey('sk_test_abcdefghijklmnopqrstuvwxyz');
    }).not.toThrow();

    expect(() => {
      validateStripeApiKey('rk_test_1234567890');
    }).not.toThrow();
  });
});
