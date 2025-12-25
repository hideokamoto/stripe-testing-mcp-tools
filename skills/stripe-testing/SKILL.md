---
name: stripe-testing
description: Stripe統合テスト用MCPサーバー（stripe-test-mcp）の使い方ガイド。テストクロックによる時間シミュレーション、サブスクリプションテスト、テストデータ管理のワークフローを提供します。
---

# Stripe Testing Skill

Stripe統合のテストを効率化するためのスキルです。`stripe-test-mcp` MCPサーバーと組み合わせて使用します。

## 前提条件

このスキルを使用する前に、以下の設定が必要です：

1. **MCPサーバーの設定**: `stripe-test-mcp` がClaude Codeに設定されていること
2. **APIキー**: Stripeの**テストモード**のAPIキー（`sk_test_` で始まるもの）

```json
{
  "mcpServers": {
    "stripe-test-mcp": {
      "command": "npx",
      "args": ["stripe-test-mcp"],
      "env": {
        "STRIPE_API_KEY": "sk_test_your_key_here"
      }
    }
  }
}
```

## 利用可能なツール

| ツール | 用途 |
|--------|------|
| `create_stripe_test_clock` | テストクロック作成（時間シミュレーション用） |
| `advance_stripe_test_clock` | テストクロックを進める |
| `create_stripe_test_customers` | テスト顧客作成 |
| `delete_stripe_test_customers` | テスト顧客削除 |
| `create_stripe_test_subscription` | サブスクリプション作成 |
| `archive_stripe_test_products` | 商品アーカイブ |
| `delete_stripe_test_products` | 商品削除 |

## ワークフロー

### 1. サブスクリプションライフサイクルテスト

月額サブスクリプションの請求サイクルをテストする場合：

1. **テストクロック作成**: 開始日時を指定
2. **顧客作成**: テストクロックに紐付け（最大3名）
3. **サブスクリプション作成**: 顧客にプランを割り当て
4. **時間を進める**: 1ヶ月後、2ヶ月後...と進めて請求を確認

```
例: 2024年1月1日開始で月額プランをテスト
→ create_stripe_test_clock (frozen_time: 1704067200)
→ create_stripe_test_customers (test_clock: clock_xxx)
→ create_stripe_test_subscription (customer: cus_xxx, items: [...])
→ advance_stripe_test_clock (frozen_time: 1706745600) # 2月1日
```

### 2. トライアル期間テスト

無料トライアル → 有料への移行をテスト：

1. テストクロックを作成
2. トライアル付きサブスクリプションを作成
3. トライアル終了日まで時間を進める
4. 請求が発生することを確認

### 3. テストデータクリーンアップ

テスト後の環境をクリーンに保つ：

1. `delete_stripe_test_customers`: 不要な顧客を削除
2. `archive_stripe_test_products`: 商品を非アクティブ化
3. `delete_stripe_test_products`: 商品を完全削除（注意: 関連データも消える）

## ベストプラクティス

### テストクロック使用時の注意

- **1つのテストクロックに紐付けられる顧客は最大3名**
- テストクロックは「進める」ことしかできない（戻せない）
- 本番環境では使用不可（テストモード専用）

### 安全なテスト

- 必ず `sk_test_` で始まるAPIキーを使用
- 本番キー（`sk_live_`）は拒否されます
- テストデータには識別可能な名前をつける（例: `[TEST] Customer`）

### 効率的なワークフロー

1. シナリオごとに新しいテストクロックを作成
2. 関連する顧客・サブスクリプションをまとめて作成
3. テスト完了後は顧客を削除してクリーンアップ

## よくあるエラーと対処法

| エラー | 原因 | 対処 |
|--------|------|------|
| "You cannot use a live Stripe secret key" | 本番キーを使用 | `sk_test_` キーに変更 |
| "You can not associate more than 3 customers" | テストクロックの制限 | 新しいテストクロックを作成 |
| "No such customer" | 顧客IDが無効 | 顧客IDを再確認 |

## 参考リンク

- [Stripe Test Clocks ドキュメント](https://stripe.com/docs/billing/testing/test-clocks)
- [stripe-test-mcp リポジトリ](https://github.com/hideokamoto/stripe-testing-mcp-tools)
