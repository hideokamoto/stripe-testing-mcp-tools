---
name: stripe-testing
description: Stripe統合テスト用のPower。テストクロックによる時間シミュレーション、サブスクリプションテスト、テストデータ管理を提供します。
version: 0.1.0
keywords:
  - stripe
  - testing
  - subscription
  - billing
  - test-clock
  - payment
mcpServers:
  - stripe-test-mcp
---

# Stripe Testing Power

Stripe統合のテストを効率化するPowerです。テストクロックを使った時間シミュレーション、サブスクリプションのライフサイクルテスト、テストデータの管理が可能です。

## セットアップ

### 1. 環境変数の設定

Stripeのテストモード APIキーを設定してください：

```bash
export STRIPE_API_KEY=sk_test_your_key_here
```

> **重要**: `sk_live_` で始まる本番キーは使用できません。必ずテストキー（`sk_test_`）を使用してください。

### 2. インストール確認

Powerをインストールすると、以下のMCPツールが利用可能になります：

- `create_stripe_test_clock` - テストクロック作成
- `advance_stripe_test_clock` - テストクロック進行
- `create_stripe_test_customers` - テスト顧客作成
- `delete_stripe_test_customers` - テスト顧客削除
- `create_stripe_test_subscription` - サブスクリプション作成
- `archive_stripe_test_products` - 商品アーカイブ
- `delete_stripe_test_products` - 商品削除

## 使い方

### サブスクリプションテストの例

「月額プランの請求サイクルをテストしたい」と伝えると：

1. テストクロックを作成（開始日時を指定）
2. テスト顧客を作成（テストクロックに紐付け）
3. サブスクリプションを作成
4. 時間を1ヶ月進めて請求を確認

### テストデータクリーンアップの例

「テストデータを削除したい」と伝えると：

1. 指定した顧客を削除
2. 不要な商品をアーカイブまたは削除

## 制限事項

- テストクロック1つにつき、紐付けられる顧客は最大3名
- テストクロックは進めることのみ可能（戻せない）
- テストモード専用（本番環境では使用不可）

## 参考リンク

- [Stripe Test Clocks ドキュメント](https://stripe.com/docs/billing/testing/test-clocks)
- [stripe-test-mcp GitHub](https://github.com/hideokamoto/stripe-testing-mcp-tools)
