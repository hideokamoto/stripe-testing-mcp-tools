# Stripe Testing MCP Tools - Claude Skill / Kiro Power 展開調査レポート

## エグゼクティブサマリー

本レポートでは、現在のStripe Testing MCP Toolsを**Claude Skill**および**Kiro Power**へ展開する可能性について調査した結果をまとめています。

**結論**: 両プラットフォームへの展開は**技術的に可能**であり、相互補完的なアプローチが推奨されます。

---

## 1. 現在のプロジェクト構造

### 概要
- **タイプ**: MCPサーバー（Model Context Protocol）
- **パッケージ名**: `stripe-test-mcp`
- **実行方法**: `npx stripe-test-mcp`
- **依存関係**: `@modelcontextprotocol/sdk`, `stripe`, `zod`

### 提供ツール
| ツール名 | 機能 |
|---------|------|
| `create_stripe_test_clock` | テストクロック作成 |
| `advance_stripe_test_clock` | テストクロック進行 |
| `create_stripe_test_subscription` | テストサブスクリプション作成 |
| `archive_stripe_test_products` | 商品アーカイブ |
| `delete_stripe_test_products` | 商品削除 |
| `create_stripe_test_customers` | テスト顧客作成 |
| `delete_stripe_test_customers` | テスト顧客削除 |

---

## 2. Claude Skill について

### 概要
- **リリース**: 2025年10月（Anthropic）
- **公式リポジトリ**: [github.com/anthropics/skills](https://github.com/anthropics/skills)
- **対応プラットフォーム**: Claude.ai, Claude Code, Claude Agent SDK, Claude Developer Platform

### 構造
```
my-skill/
├── SKILL.md          # 必須: メタデータ + 指示内容
├── reference.md      # オプション: リファレンス文書
├── examples.md       # オプション: 使用例
├── scripts/          # オプション: ヘルパースクリプト
└── templates/        # オプション: テンプレート
```

### SKILL.md の構造
```yaml
---
name: stripe-testing
description: Stripe統合テスト用のMCPツールと使用ガイド
---

# Stripe Testing Skill

## 概要
[スキルの説明]

## 使用例
[具体的なワークフロー]

## ガイドライン
[ベストプラクティス]
```

### MCPとの関係
- **MCP**: 外部ツール/APIへのアクセス手段（「ハードウェア店の通路」）
- **Skill**: ツールの使い方の専門知識（「店員の専門知識」）
- **組み合わせ**: MCPで接続し、Skillでワークフローを最適化

### 特徴
- モデル起動型（Claudeが自動判断して使用）
- 必要な時のみロード（効率的）
- ポータブル（複数プラットフォーム対応）

---

## 3. Kiro Power について

### 概要
- **リリース**: 2025年12月（AWS re:Invent 2025）
- **公式サイト**: [kiro.dev/powers](https://kiro.dev/powers/)
- **対応プラットフォーム**: Kiro IDE, Kiro CLI（将来: Cursor, Claude Code等）

### 構造
```
my-power/
├── POWER.md          # 必須: メタデータ + オンボーディング
├── mcp.json          # MCPサーバー設定
└── steering/         # オプション: ワークフローガイド
    └── workflow.md
```

### POWER.md の構造
```yaml
---
name: stripe-testing
description: Stripe統合テストを効率化するPower
keywords:
  - stripe
  - testing
  - subscription
  - payment
mcpServers:
  - stripe-test-mcp
---

# Stripe Testing Power

## オンボーディング
[セットアップ手順]

## ワークフロー
[使用ガイド]
```

### mcp.json の構造
```json
{
  "mcpServers": {
    "stripe-test-mcp": {
      "command": "npx",
      "args": ["stripe-test-mcp"],
      "env": {
        "STRIPE_API_KEY": "${STRIPE_API_KEY}"
      }
    }
  }
}
```

### 特徴
- ワンクリックインストール
- コンテキストの動的ロード（パフォーマンス最適化）
- 環境変数による認証情報管理
- 無料で利用可能

---

## 4. 展開可能性の比較

| 項目 | Claude Skill | Kiro Power |
|------|-------------|------------|
| **技術的難易度** | 低 | 低〜中 |
| **MCPサーバー連携** | 間接的（ユーザー設定必要） | 直接的（mcp.json同梱） |
| **配布方法** | GitHubまたはnpm | Kiro Marketplace |
| **ターゲットユーザー** | Claude Code / Claude.aiユーザー | Kiro IDEユーザー（AWS開発者） |
| **将来性** | Anthropicエコシステム中心 | クロスプラットフォーム計画あり |

---

## 5. 推奨展開戦略

### Phase 1: Claude Skill の作成（優先度: 高）

**理由**:
- 既存MCPサーバーを活用する追加レイヤー
- ワークフロー/ベストプラクティスの提供に最適
- 開発コスト最小

**作成するファイル**:
```
skills/stripe-testing/
├── SKILL.md              # メイン指示
├── workflows/
│   ├── subscription-testing.md   # サブスク テストワークフロー
│   ├── time-simulation.md        # 時間シミュレーション
│   └── cleanup.md                # データクリーンアップ
└── examples/
    └── common-scenarios.md       # 一般的なシナリオ
```

**SKILL.md 内容案**:
- Stripe Test Clockの効果的な使い方
- サブスクリプションテストのベストプラクティス
- テストデータ管理のワークフロー
- よくあるエラーと対処法

### Phase 2: Kiro Power の作成（優先度: 中）

**理由**:
- AWS/Kiroエコシステムへのリーチ拡大
- MCPサーバーをバンドル配布可能
- ワンクリックインストールでUX向上

**作成するファイル**:
```
power-stripe-testing/
├── POWER.md
├── mcp.json
└── steering/
    ├── test-clock-workflow.md
    ├── subscription-testing.md
    └── data-cleanup.md
```

### Phase 3: 統合マーケットプレイス登録

- Anthropic Skills Library への登録
- Kiro Powers Marketplace への登録
- npm/GitHub での一元管理

---

## 6. 実装上の考慮事項

### セキュリティ
- APIキーは環境変数経由で設定（ハードコード禁止）
- テストキーのみ許可する現在のバリデーションを維持

### ドキュメント
- 各プラットフォーム向けのセットアップガイド作成
- ユースケース別のチュートリアル

### メンテナンス
- MCPサーバーのバージョンアップに合わせてSkill/Power更新
- ユーザーフィードバックの収集体制

---

## 7. 結論

| 展開先 | 実現可能性 | 推奨度 | 工数見積もり |
|--------|-----------|--------|-------------|
| Claude Skill | ○ 容易 | ★★★★★ | 小（数日） |
| Kiro Power | ○ 容易 | ★★★★☆ | 小〜中（1週間程度） |

**両プラットフォームへの展開を推奨します。**

- **Claude Skill**: ワークフローガイダンスとベストプラクティスの提供に重点
- **Kiro Power**: MCPサーバーのバンドル配布とAWSエコシステムへのリーチ拡大

どちらも既存のMCPサーバーをラップする形で、追加開発コストは最小限に抑えられます。

---

## 参考リソース

### Claude Skill
- [Anthropic Skills GitHub](https://github.com/anthropics/skills)
- [Claude Skills are awesome, maybe a bigger deal than MCP](https://simonwillison.net/2025/Oct/16/claude-skills/)
- [Skills explained: How Skills compares to prompts, Projects, MCP, and subagents](https://claude.com/blog/skills-explained)
- [Inside Claude Code Skills: Structure, prompts, invocation](https://mikhail.io/2025/10/claude-code-skills/)

### Kiro Power
- [Kiro Powers 公式](https://kiro.dev/powers/)
- [Introducing Kiro powers](https://kiro.dev/blog/introducing-powers/)
- [Create powers - Kiro Docs](https://kiro.dev/docs/powers/create/)
- [AWS introduces powers for AI-powered Kiro IDE](https://www.infoworld.com/article/4099811/aws-introduces-powers-for-ai-powered-kiro-ide.html)
