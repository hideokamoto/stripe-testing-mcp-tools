# Pitfalls: stripe fixtures の落とし穴集

調査時点で確認できた既知問題と、回避策。 Skill が fixture を生成する際、これらに該当する操作を含む場合は **Phase 4 の検証で必ず警告を出す**こと。

---

## 1. 配列インデックス記法のズレ（docs vs 実装）

### 問題

公式 docs（CLI Wiki）には以下の記法が示されている:

```text
${cus_jenny_rosen:subscriptions.data.[0].id}
```

しかし実際の実装では `.[0]` 記法は動かず、 `.0.` のようなドット区切りの数字が正しいという報告がある（[Issue #962](https://github.com/stripe/stripe-cli/issues/962), 2022-09）。

### 回避策

- **配列要素アクセスは `.0` を使う**（例: `${cus:subscriptions.data.0.id}`）
- 生成時に `\.\[\d+\]` パターンが含まれていないかチェックする
- もし docs どおりの `.[0]` 記法を採用したい場合は、 Phase 4.3 の dry-run で先に確認する

### Skill の対応

Phase 4.1 の静的検証で、 `\.\[\d+\]` パターンを正規表現でチェックし、見つかったら警告する。

---

## 2. `--add` フラグの panic バグ

### 問題

[Issue #826](https://github.com/stripe/stripe-cli/issues/826) で `stripe trigger payment_intent.succeeded --add confirm=true` のような単純な `--add` 利用が `panic: runtime error: index out of range` で落ちる例が報告されている。これは `fixtures.go` の `buildRewrites` 関数の挙動に起因する。

### 回避策

- `--add` ではなく `--override` を優先利用する
- どうしても `--add` を使うなら、 fixture の name を完全パス指定する形にする（例: `--add fixture_name.params.field=value`）
- 値の追加は **生成時に JSON 内に直接書く**ほうが安全

### Skill の対応

Phase 4.3 の実行案内で `--add` を**標準では推奨しない**。`--override` を優先案内する。

---

## 3. 複数 fixture ファイルを一度に渡せない

### 問題

[Issue #910](https://github.com/stripe/stripe-cli/issues/910) で要望されているが、 `stripe fixtures` は一度に1ファイルしか実行できない。

```bash
# できない
stripe fixtures a.json b.json

# 必要な書き方
stripe fixtures a.json && stripe fixtures b.json
```

### 設計上の影響

「シナリオを複数 fixture に分割する」設計は推奨しない。**1シナリオ = 1 JSON ファイル**で完結させる。複雑になる場合は `--skip` で部分実行できるよう、 fixture entry 名を機能ごとに整理する。

### Skill の対応

Phase 3 の生成時、シナリオを複数ファイルに分割しない。1ファイル内で完結する設計を取る。例外的に「セットアップ → テスト → クリーンアップ」のように責務が違う場合は、ユーザーに分割可否を確認する。

---

## 4. metadata の文字列扱い

### 問題

[Issue #725](https://github.com/stripe/stripe-cli/issues/725) では `metadata` フィールドに長文字列を入れた際の挙動が報告されている（その後修正されているが、文字数制限などは API 仕様に従う）。

### 注意点

- `metadata` の値は **すべて文字列** として扱われる（数値も自動的に文字列化される）
- 入れ子オブジェクトは metadata 直下では表現できない（フラットな key-value のみ）
- key は最大40文字、 value は最大500文字（API 仕様）

### Skill の対応

Phase 3 で metadata を生成する際、値を必ず文字列として扱う。

---

## 5. boolean / 数値の型扱い（推測ではなく実例ベース）

### 確認できたこと

[Issue #1116](https://github.com/stripe/stripe-cli/issues/1116) で示された stripe trigger の内部 fixture JSON では、 `cvc: 314`、 `exp_month: 10` のように**数値はそのまま integer**で書かれている。同様に boolean も boolean のまま書けると考えられる。

### 注意すべき点

ただし、 `metadata` フィールド内は **API 仕様で全て文字列化**されるため、ここに数値を入れる場合は文字列で書くこと:

```json
"metadata": {
  "order_id": "12345",
  "is_priority": "true"
}
```

### Skill の対応

- `params` 直下: boolean / number はそのまま JSON の native 型で書く
- `metadata` 内: すべて文字列で書く

このルールは公式 trigger fixture の実例から起こしたもので、私（Skill 作成時の AI）の実機検証ではない。実機実行で挙動が違った場合は **正しい挙動を優先**し、この pitfalls.md を更新する。

---

## 6. test_clock の advance には interval の制約がある

### 問題

test clock は1回の advance で **shortest subscription interval の最大2倍まで**しか進められない。例えば月次サブスクなら2ヶ月先まで。

### 回避策

- 長期間の進行が必要な場合は、 advance を複数回 fixture entry として並べる
- subscription が無い test_clock は最大2年先まで一度に進められる

### Skill の対応

ユーザーが「6ヶ月分進めたい」のような要求を出した場合、月次サブスクなら advance × 3 を fixture 内に並べる必要があることを Phase 3 で説明する。

---

## 7. `_meta.template_version` は `0` 固定

### 補足情報

`template_version` は2020年から `0` のまま変わっていない。 Skill は常に `0` で生成する。 `1` 以上を指定すると `Fixture version not supported` エラーで起動しない。

---

## 8. Live key への防御は CLI 側にない

### 問題

`stripe fixtures` 自体は `STRIPE_API_KEY` の prefix チェックをしない。 `sk_live_` で実行すれば本番アカウントでテストデータが作られる事故が起きうる。

### Skill の対応

- description で警告
- Phase 4.2 で `STRIPE_API_KEY` の prefix 確認コマンドをユーザーに必ず案内
- 仮に Phase 3 ラッパー CLI を作る場合は、ここで強制ブロックする

---

## 9. 配列形式の params (line_items, items など)

### 注意点

`line_items` や subscription の `items` のような配列パラメータは、 fixture JSON では **配列リテラルで書く**:

```json
"items": [
  { "price": "${price:id}" }
]
```

API としては `items[0][price]=xxx` のフォームエンコーディングに変換される。 fixture の中で `items.0.price` のような書き方をしてはならない（これは response 参照の構文）。

### Skill の対応

Phase 3 で配列パラメータを生成する際、 JSON 配列構文を使う。

---

## 10. expected_error_type の使い方

### 補足情報

[`FixtureRequest` 構造体](https://pkg.go.dev/github.com/stripe/stripe-cli/pkg/fixtures) には `expected_error_type` フィールドがある。失敗を**期待**する fixture entry に付ければ、エラーで止まらず継続する。

```json
{
  "name": "expect_failure",
  "path": "/v1/payment_intents/${pi:id}/confirm",
  "method": "post",
  "expected_error_type": "card_error",
  "params": { ... }
}
```

### 用途

失敗カードでの payment_intent 失敗を含むシナリオで活用する。`expected_error_type` を指定しないと、エラー発生時点で fixture 全体が止まる。
