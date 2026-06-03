// All landing-page copy for both locales lives here.
// The page components are language-agnostic and read from `content[lang]`.

export type Lang = 'en' | 'ja';

export interface Feature {
  title: string;
  body: string;
}

export interface Example {
  prompt: string;
  note: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface LocaleContent {
  htmlLang: string;
  title: string;
  description: string;
  nav: { docs: string; github: string };
  hero: {
    badge: string;
    headline: string;
    sub: string;
    installLabel: string;
    install: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  problem: {
    heading: string;
    lead: string;
    beforeLabel: string;
    afterLabel: string;
    before: string;
    after: string;
  };
  demo: {
    heading: string;
    lead: string;
    lines: string[];
  };
  features: { heading: string; items: Feature[] };
  install: {
    heading: string;
    lead: string;
    claudeLabel: string;
    claude: string;
    cursorLabel: string;
    cursor: string;
    prereq: string;
  };
  examples: { heading: string; lead: string; items: Example[] };
  compare: {
    heading: string;
    lead: string;
    cols: string[];
    rows: { label: string; cells: string[] }[];
  };
  faq: { heading: string; items: Faq[] };
  footer: {
    cta: string;
    star: string;
    contribute: string;
    license: string;
    builtWith: string;
  };
}

export const githubUrl = 'https://github.com/hideokamoto/stripe-testing-mcp-tools';

export const content: Record<Lang, LocaleContent> = {
  en: {
    htmlLang: 'en',
    title: 'stripe-fixtures — Generate Stripe CLI fixture JSON from plain English',
    description:
      'A Claude Code / Cursor Agent Skill that turns a plain-language test scenario into runnable `stripe fixtures` JSON — test clocks, subscription lifecycles, failing cards, Connect charges, and bulk data.',
    nav: { docs: 'Docs', github: 'GitHub' },
    hero: {
      badge: 'Agent Skill · Claude Code & Cursor · Apache-2.0',
      headline: 'Describe a Stripe test scenario. Get runnable fixture JSON.',
      sub: 'stripe-fixtures is an Agent Skill that turns plain language into validated `stripe fixtures` JSON — no schema lore, no doc-tab juggling.',
      installLabel: 'Install',
      install: 'npx skills add hideokamoto/stripe-testing-mcp-tools --skill stripe-fixtures',
      ctaPrimary: 'Get started',
      ctaSecondary: 'View on GitHub',
    },
    problem: {
      heading: 'Hand-writing fixture JSON is the slow part',
      lead: '`stripe fixtures` chains API calls with `${name:json_path}` references. Powerful — but you have to know every response shape, every path, and the array-index quirks. There is no repeat syntax for N copies.',
      beforeLabel: 'Before',
      afterLabel: 'After',
      before:
        '40+ lines of JSON, Stripe API docs open in another tab, 20 minutes of copy-paste — then a cryptic error on first run.',
      after:
        '"A subscription with a 14-day trial that fails on first renewal, then succeeds on retry" → a validated fixture, ready to run.',
    },
    demo: {
      heading: 'What it looks like',
      lead: 'Describe the scenario in Claude Code or Cursor. The skill picks the closest reference, adapts it, and runs static checks before handing it back.',
      lines: [
        '$ # in Claude Code',
        '> Build a fixture that advances a test clock so the subscription invoices and fails',
        '',
        '✶ stripe-fixtures  selecting reference: failing-subscription.json',
        '✶ generating fixtures.json …',
        '✓ template_version = 0',
        '✓ all ${refs} defined before use',
        '✓ array access uses dot notation',
        '✓ every path starts with /v1/',
        '',
        '$ stripe fixtures fixtures.json',
        '→ customer, payment_method, test_clock, subscription … invoice.payment_failed ✓',
      ],
    },
    features: {
      heading: 'What the skill handles',
      items: [
        {
          title: 'Time travel with test clocks',
          body: 'test_helpers / test_clock advancement for trial expiry, renewals, and dunning — wired in the right order.',
        },
        {
          title: 'Failure paths, on purpose',
          body: 'Failing cards and `expected_error_type` so a failure does not abort the whole fixture run.',
        },
        {
          title: 'Bulk at any scale',
          body: 'N identical resources expanded mechanically with sequential naming — the part no one wants to hand-write.',
        },
        {
          title: 'Connect & multi-currency',
          body: 'Destination charges under Connect and JPY/USD scenarios, adapted from reference fixtures.',
        },
        {
          title: 'Static validation built in',
          body: 'Reference integrity, dot-notation array access, /v1/ path checks, and known-pitfall callouts before you run.',
        },
        {
          title: 'Knows when NOT to fixture',
          body: 'If `stripe trigger` is enough, it tells you — instead of generating JSON you do not need.',
        },
      ],
    },
    install: {
      heading: 'Install',
      lead: 'Add the skill to your agent, then describe a scenario.',
      claudeLabel: 'Claude Code',
      claude: 'npx skills add hideokamoto/stripe-testing-mcp-tools --skill stripe-fixtures',
      cursorLabel: 'Or pin a version with gh skill',
      cursor: 'gh skill install hideokamoto/stripe-testing-mcp-tools stripe-fixtures',
      prereq:
        'Requires the Stripe CLI and a test-mode key (`sk_test_…`). You run `stripe fixtures` locally — the skill never touches your account.',
    },
    examples: {
      heading: 'Example prompts',
      lead: 'Natural language in, runnable fixture out.',
      items: [
        {
          prompt: 'Advance a test clock so the subscription invoices and fails.',
          note: 'test_clock × failing card × billing cycle',
        },
        {
          prompt: 'Bulk-create 80 test customers with the same metadata tag.',
          note: 'sequential naming, shared cleanup tag',
        },
        {
          prompt: 'Connect destination charge in JPY with an application fee.',
          note: 'Connect × multi-currency',
        },
        {
          prompt: 'Should I use stripe trigger or a fixture for this?',
          note: 'Phase 0 retreat check',
        },
      ],
    },
    compare: {
      heading: 'Why not just use what I have?',
      lead: 'The honest comparison for anyone already on the Stripe CLI.',
      cols: ['', 'stripe trigger', 'Raw fixtures', 'stripe-fixtures'],
      rows: [
        { label: 'Input', cells: ['event name', 'hand-written JSON', 'plain language'] },
        { label: 'Complex scenarios', cells: ['limited', '✓', '✓'] },
        { label: 'Hand-written JSON', cells: ['no', 'required', 'not needed'] },
        { label: 'Bulk N copies', cells: ['no', 'manual', '✓'] },
        { label: 'Static validation', cells: ['—', 'you do it', '✓'] },
        { label: 'Works offline (file only)', cells: ['no', '✓', '✓'] },
      ],
    },
    faq: {
      heading: 'FAQ',
      items: [
        {
          q: 'Does it run stripe fixtures for me?',
          a: 'No. It generates and statically validates the JSON; you run `stripe fixtures` in your own environment. That keeps your keys and account fully under your control.',
        },
        {
          q: 'Does it call the Stripe API?',
          a: 'No. The skill produces a file. Nothing hits the network until you choose to run it.',
        },
        {
          q: 'Test mode or live mode?',
          a: 'Test mode only is recommended. The skill reminds you to confirm your key starts with `sk_test_` before running.',
        },
        {
          q: 'What if my scenario is not supported?',
          a: 'It leaves clearly marked placeholder values for you to swap in, rather than guessing and risking a silent mistake.',
        },
        {
          q: '日本語でも使えますか？',
          a: 'Yes — the skill itself is bilingual. Switch this page to 日本語 from the top-right.',
        },
      ],
    },
    footer: {
      cta: 'Open source, Apache-2.0. The repository is the product.',
      star: 'Star on GitHub',
      contribute: 'Contribute',
      license: 'Apache-2.0',
      builtWith: 'Built with Astro',
    },
  },

  ja: {
    htmlLang: 'ja',
    title: 'stripe-fixtures — 自然言語から Stripe CLI の fixture JSON を生成',
    description:
      'テストシナリオを自然言語で書くだけで、実行可能な `stripe fixtures` JSON を生成する Claude Code / Cursor 向け Agent Skill。test clock、サブスクのライフサイクル、失敗カード、Connect、bulk 生成に対応。',
    nav: { docs: 'ドキュメント', github: 'GitHub' },
    hero: {
      badge: 'Agent Skill · Claude Code & Cursor · Apache-2.0',
      headline: 'Stripe のテストシナリオを書くだけ。実行可能な fixture JSON が返る。',
      sub: 'stripe-fixtures は、自然言語を検証済みの `stripe fixtures` JSON に変える Agent Skill。スキーマの暗記も docs タブの往復も不要です。',
      installLabel: 'インストール',
      install: 'npx skills add hideokamoto/stripe-testing-mcp-tools --skill stripe-fixtures',
      ctaPrimary: 'はじめる',
      ctaSecondary: 'GitHub で見る',
    },
    problem: {
      heading: '手書きの fixture JSON が、いちばん遅い',
      lead: '`stripe fixtures` は `${name:json_path}` 参照で API 呼び出しを連鎖できます。強力ですが、response shape も path も配列インデックスの癖も把握している必要があり、N 個生成の繰り返し構文もありません。',
      beforeLabel: 'Before',
      afterLabel: 'After',
      before:
        '40 行超の JSON、別タブに開いた Stripe docs、コピペ 20 分 — そして初回実行で意味不明なエラー。',
      after:
        '「14 日トライアル後、初回更新で失敗し、リトライで成功するサブスク」→ 検証済みの fixture が即実行可能な形で返る。',
    },
    demo: {
      heading: '使用イメージ',
      lead: 'Claude Code / Cursor でシナリオを伝えるだけ。最も近い参照を選び、改変し、静的検証してから返します。',
      lines: [
        '$ # Claude Code で',
        '> test clock を進めてサブスクが請求・失敗する fixture を作って',
        '',
        '✶ stripe-fixtures  参照を選択: failing-subscription.json',
        '✶ fixtures.json を生成中 …',
        '✓ template_version = 0',
        '✓ すべての ${ref} が先に定義済み',
        '✓ 配列アクセスはドット表記',
        '✓ 全 path が /v1/ 始まり',
        '',
        '$ stripe fixtures fixtures.json',
        '→ customer, payment_method, test_clock, subscription … invoice.payment_failed ✓',
      ],
    },
    features: {
      heading: 'スキルが担うこと',
      items: [
        {
          title: 'test clock で時間を進める',
          body: 'トライアル終了・更新・dunning のための test_helpers / test_clock 進行を、正しい順序で配線。',
        },
        {
          title: '失敗パスを意図的に',
          body: '失敗カードと `expected_error_type`。失敗で fixture 全体が止まらないように記述します。',
        },
        {
          title: 'bulk をどんな件数でも',
          body: '同一リソースを連番命名で機械的に N 個展開。誰も手で書きたくない部分です。',
        },
        {
          title: 'Connect・多通貨',
          body: 'Connect 配下の destination charge や JPY/USD シナリオを、参照 fixture から改変。',
        },
        {
          title: '静的検証を内蔵',
          body: '参照整合性、ドット表記の配列アクセス、/v1/ path、既知の落とし穴チェックを実行前に。',
        },
        {
          title: 'fixture 不要なら止める',
          body: '`stripe trigger` で済むなら、不要な JSON を作らずにそう案内します。',
        },
      ],
    },
    install: {
      heading: 'インストール',
      lead: 'スキルをエージェントに追加し、シナリオを伝えるだけ。',
      claudeLabel: 'Claude Code',
      claude: 'npx skills add hideokamoto/stripe-testing-mcp-tools --skill stripe-fixtures',
      cursorLabel: 'gh skill でバージョン固定する場合',
      cursor: 'gh skill install hideokamoto/stripe-testing-mcp-tools stripe-fixtures',
      prereq:
        'Stripe CLI と test mode key（`sk_test_…`）が必要です。`stripe fixtures` の実行はあなたの環境で行い、スキルがアカウントに触れることはありません。',
    },
    examples: {
      heading: 'プロンプト例',
      lead: '自然言語を入れると、実行可能な fixture が返ります。',
      items: [
        {
          prompt: 'test clock を進めてサブスクが請求・失敗するようにして。',
          note: 'test_clock × 失敗カード × 請求サイクル',
        },
        {
          prompt: '同じ metadata タグで 80 件のテスト顧客を bulk 作成して。',
          note: '連番命名・共通 cleanup タグ',
        },
        {
          prompt: 'JPY の Connect destination charge を application fee 付きで。',
          note: 'Connect × 多通貨',
        },
        {
          prompt: 'これは stripe trigger と fixture どっちを使うべき？',
          note: 'Phase 0 の撤退判定',
        },
      ],
    },
    compare: {
      heading: '今あるもので十分では？',
      lead: 'すでに Stripe CLI を使っている人向けの正直な比較。',
      cols: ['', 'stripe trigger', '生の fixtures', 'stripe-fixtures'],
      rows: [
        { label: '入力', cells: ['event 名', '手書き JSON', '自然言語'] },
        { label: '複雑なシナリオ', cells: ['限定的', '✓', '✓'] },
        { label: '手書き JSON', cells: ['不要', '必須', '不要'] },
        { label: 'bulk N 件', cells: ['不可', '手作業', '✓'] },
        { label: '静的検証', cells: ['—', '自分で', '✓'] },
        { label: 'オフライン動作（ファイルのみ）', cells: ['不可', '✓', '✓'] },
      ],
    },
    faq: {
      heading: 'よくある質問',
      items: [
        {
          q: 'stripe fixtures の実行までやってくれる？',
          a: 'いいえ。JSON の生成と静的検証までで、`stripe fixtures` の実行はあなたの環境で行います。キーとアカウントは完全にあなたの管理下に残ります。',
        },
        {
          q: 'Stripe API を呼び出す？',
          a: 'いいえ。スキルはファイルを生成するだけ。あなたが実行するまでネットワークには一切アクセスしません。',
        },
        {
          q: 'test mode と live mode どちら？',
          a: 'test mode のみを推奨します。実行前にキーが `sk_test_` で始まることの確認を促します。',
        },
        {
          q: 'シナリオが対応外だったら？',
          a: '推測で値を埋めて事故になるより、差し替えが必要な箇所を明示したプレースホルダとして残します。',
        },
        {
          q: 'Can I use this in English?',
          a: 'はい。スキル自体がバイリンガルです。右上から English に切り替えられます。',
        },
      ],
    },
    footer: {
      cta: 'オープンソース・Apache-2.0。リポジトリそのものがプロダクトです。',
      star: 'GitHub で Star',
      contribute: 'コントリビュート',
      license: 'Apache-2.0',
      builtWith: 'Built with Astro',
    },
  },
};
