# Reference Index

このディレクトリには、 fixture JSON 生成時に下敷きとして参照する6本のシナリオが格納されている。 SKILL.md の Phase 2 で「最も近い1本」を選び、ユーザー要件に合わせて改変する。

## 軸別索引

### 時系列軸（時間進行を含むか）

| 含む | 含まない |
|---|---|
| `failing-subscription.json` | `successful-checkout.json` |
| `subscription-with-trial.json` | `refund-and-dispute.json` |
| | `connect-destination-jpy.json` |
| | `bulk-customers.json` |

### 結果軸（成功/失敗）

| 成功 | 失敗を含む |
|---|---|
| `successful-checkout.json` | `failing-subscription.json` |
| `subscription-with-trial.json` | `refund-and-dispute.json` |
| `connect-destination-jpy.json` | |
| `bulk-customers.json` | |

### 規模軸

| 単発 | bulk |
|---|---|
| 上記5本 | `bulk-customers.json` |

### アカウント軸

| Direct | Connect |
|---|---|
| 上記5本 | `connect-destination-jpy.json` |

### 通貨軸

| USD（デフォルト） | JPY |
|---|---|
| 上記5本 | `connect-destination-jpy.json` |

## ファイルごとの簡潔な説明

### `failing-subscription.json`
**シナリオ**: test_clock を作成し、失敗するカードでサブスクを作って月次請求を失敗させる。

**含まれる要素**:
- test_clock 作成
- test_clock に attach した customer
- 失敗カード (4000 0000 0000 0341 系) の payment_method
- product / price (月次)
- subscription 作成
- test_clock advance（月次1回ぶん時間進行）

**最頻シナリオ**。サブスクの dunning フローテストで使う。

### `successful-checkout.json`
**シナリオ**: 単発 product / price を作って Checkout Session を作り、決済まで完了させる。

**含まれる要素**:
- product / price
- Checkout Session 作成
- （実際の決済は payment_page 系の fixture で連鎖、`stripe trigger checkout.session.completed` の内部 fixture と類似構造）

**用途**: Webhook テスト、最小構成の動作確認

### `refund-and-dispute.json`
**シナリオ**: 1人の customer に対し、(1) 成功カードの charge を作って部分 refund を発行し、(2) 別途 dispute 誘発カードで charge を作って dispute を発生させる。

**含まれる要素**:
- payment_method（成功カード `4242424242424242`）+ payment_intent (confirm 済み) + 部分 refund 作成
- payment_method（dispute 誘発カード `4000000000000259`）+ payment_intent (confirm 済み)
  - このカードは charge 成立後に **非同期で dispute（`charge.dispute.created`）が自動生成**される。`/v1/disputes` への直接 POST は不可で、誘発カードで起こすのが Stripe の作法

**用途**: 返金フロー、 dispute フローの webhook テスト

### `connect-destination-jpy.json`
**シナリオ**: Connect 配下のアカウントへ JPY で Destination charge を作る。

**含まれる要素**:
- Connect Account（Express or Standard 仮置き）
- payment_method
- payment_intent (currency=jpy, transfer_data.destination=<connected_account_id>)
- application_fee_amount

**用途**: マーケットプレイス・プラットフォーム型サービスのテスト。 JPY 特有の挙動（小数なし、最小額の扱い）を含む。

**注意**: Connected Account の事前作成は手動 or 別 fixture で。この JSON は既存の Connected Account ID を `${.env:CONNECTED_ACCOUNT_ID}` で参照する形を採用。

### `bulk-customers.json`
**シナリオ**: 5件の test customer を一括作成する（参考形）。

**含まれる要素**:
- customer × 5、 metadata に共通 tag

**用途**: bulk 機能の参考。 Skill が N 件に拡張する。

**この JSON は単独で実用するより、 Skill が「N 件展開」を行う際の構造的下敷きとして使う。**

### `subscription-with-trial.json`
**シナリオ**: trial 期間付きサブスクを作って trial 終了で初回請求を発生させる。

**含まれる要素**:
- test_clock
- customer (test_clock attach)
- payment_method (成功カード)
- product / price (月次、trial 14日)
- subscription (trial_period_days=14)
- test_clock advance (15日後)

**用途**: trial 終了時の挙動、 `customer.subscription.trial_will_end` webhook テスト
