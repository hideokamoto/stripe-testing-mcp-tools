# stripe-fixtures

Stripe CLI の `stripe fixtures <filepath>` コマンドで実行可能な fixture JSON を、Claude との対話で整理・生成・検証するための Agent Skill。

## 何のための Skill か

`stripe fixtures` は、複数の Stripe API リクエストを JSON ファイルにシーケンス化して実行できる強力なテストハーネスだが、参照構文・path 指定・配列の繰り返し展開などが煩雑で、人間が直接書くのは現実的ではない。

このSkillは「対話を通じて要件を整理 → fixture JSON を生成 → 静的検証 → 実行手順を案内」というフローを担う。 Claude Design がデザイン要件を対話的にまとめて UI を出すのと同じ構造で、 fixture という出力に特化している。

## Skill の対象範囲

**やる:**

- 複数ステップの API リクエスト連鎖を fixture JSON 化
- test_helpers (test_clock) を含む時系列シナリオ
- 失敗カードでの payment_intent 失敗の表現
- bulk（同一リソースを N 件展開）
- Connect 配下のリソース操作
- 既知の落とし穴（配列記法、`--add` バグ等）の警告

**やらない:**

- 単発 API 呼び出し（`stripe trigger` で済むもの）→ 撤退判定して案内
- fixture の実機実行（ユーザーが `stripe fixtures` で実行）
- Live key への強制ブロック（CLI 側の責務）

## ディレクトリ構成

```
stripe-fixtures/
├── SKILL.md              # Skill の本体。対話プロトコル、検証手順
├── README.md             # このファイル
├── pitfalls.md           # 既知の落とし穴と回避策
├── reference/
│   ├── INDEX.md
│   ├── failing-subscription.json
│   ├── successful-checkout.json
│   ├── refund-and-dispute.json
│   ├── connect-destination-jpy.json
│   ├── bulk-customers.json
│   └── subscription-with-trial.json
└── evals/
    └── evals.json        # テストケース（3本）
```

## 動作フロー（要約）

1. **Phase 0**: `stripe trigger` で済むケースを撤退判定
2. **Phase 1**: 軸の確定（最大3問の対話）
3. **Phase 2**: `reference/` から最も近い参照素材を選定
4. **Phase 3**: 要件に合わせて fixture JSON を生成
5. **Phase 4**: 静的検証 + 環境チェック指示 + 実機 dry-run の推奨
6. **Phase 5**: 実行コマンドと cleanup 手順を案内

詳細は SKILL.md を参照。

## reference/ の取り扱い

`reference/*.json` は **論理構造の参考形** であって、 Skill 作成者が実機で動作確認したものではない。各 JSON は以下の前提で書かれている:

- `_meta.template_version: 0` を採用
- 参照構文は `${name:json_path}` 形式
- 配列要素アクセスは `.0` 記法（`.[0]` は使わない、 pitfalls.md 参照）
- `params` 直下: native 型 (boolean / number そのまま) / `metadata` 内: 全て文字列
- テストカード番号は Stripe docs の代表値 (`4242424242424242` 成功 / `4000000000000341` 失敗) を仮置き

実機で動かない場合は、 pitfalls.md と Stripe 公式 docs を照合して修正する。 Skill が生成した JSON にも同じ運用が必要。

## 使い方（例）

Claude Code でこの Skill を有効化した状態で、以下のような依頼を投げる:

- 「失敗するサブスクのテストデータを fixture で作って」
- 「100件の test customer を bulk で作る fixture を書いて」
- 「Connect 配下で JPY の Destination charge を fixture で再現したい」
- 「stripe trigger と fixture どっち使うべき？」（撤退判定の相談）

Claude が対話的に軸を確認し、 reference を下敷きに JSON を生成し、検証チェックを返す。

## 既知の制約

- このSkillは Claude Code / Claude.ai 向け。 fixture の実機実行は **ユーザーが手元の stripe-cli で行う**前提
- reference の各 JSON は実機検証されていない（私の AI 訓練データと公開情報を元に構築）
- bulk 件数が大きい（>100件）場合、 fixture JSON が肥大化する。展開件数の現実的な上限は 100 件程度を目安にし、それ以上は別の手段（API SDK でのループ）を案内する

## ライセンス

MIT
