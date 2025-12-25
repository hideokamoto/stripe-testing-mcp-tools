import { describe, it, expect } from 'vitest';
import { validateStripeApiKey } from './index.js';

describe('validateStripeApiKey', () => {
  it('有効なテストAPIキーを受け入れる', () => {
    expect(() => {
      validateStripeApiKey('sk_test_1234567890');
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

  it('ライブAPIキーを含む場合、エラーを投げる', () => {
    expect(() => {
      validateStripeApiKey('sk_live_1234567890');
    }).toThrow('You cannot use a live Stripe secret key for testing');
  });

  it('ライブAPIキーが文字列内に含まれる場合、エラーを投げる', () => {
    expect(() => {
      validateStripeApiKey('prefix_sk_live_suffix');
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
