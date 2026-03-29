# kyowa-menu-history

協和メニュー食事履歴 - プライベートデータリポジトリ

## 📋 概要

このリポジトリは、食事履歴をSupabaseデータベースに記録・管理するシステムです。GitHub Pagesでホストされたフロントエンドから直接メニューを送信できます。

## 🚀 セットアップ

### 1. Supabase設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase/schema.sql`を実行してテーブルを作成
3. プロジェクトのURLとAnon Keyを取得

### 2. GitHub Secrets設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定:

- `SUPABASE_URL`: SupabaseプロジェクトのURL
- `SUPABASE_ANON_KEY`: Supabaseの匿名キー（公開用）

**重要**: `SUPABASE_SERVICE_KEY`はGitHub Actionsワークフローやローカル環境でのみ使用し、フロントエンドには注入しないでください。

### 3. GitHub Pagesの有効化

1. Settings > Pages
2. Source: **GitHub Actions**を選択

### 4. デプロイ

mainブランチにプッシュすると、GitHub Actionsが自動的にデプロイします:

```bash
git add .
git commit -m "Update configuration"
git push origin main
```

## 📂 ディレクトリ構造

```
kyowa-menu-history/
├── data/
│   ├── history/           # 食事履歴JSONファイル
│   │   ├── 2026-01-20.json
│   │   ├── 2026-01-21.json
│   │   └── ...
│   └── models/            # 学習済みモデル
│       ├── user_preferences.json
│       ├── statistics.json
│       └── recommendations.json
├── scripts/               # 学習パイプライン
│   ├── train.js
│   └── aggregate.js
└── README.md
```

## 🔐 セキュリティ

### GitHub Secrets

以下の情報はGitHub Secretsで管理されます:
- ✅ `SUPABASE_URL`: フロントエンドに注入（公開されても問題なし）
- ✅ `SUPABASE_ANON_KEY`: フロントエンドに注入（公開用キー）
- ❌ `SUPABASE_SERVICE_KEY`: サーバーサイドのみで使用（フロントエンドには注入しない）

### Row Level Security (RLS)

Supabaseでは以下のポリシーを設定:
- 匿名ユーザー: 読み取り・書き込み可能（`meal_history`テーブル）
- Service Role: 全操作可能

### 注意事項
⚠️ `.env` ファイルをコミットしないでください（`.gitignore`で除外済み）

## 📝 データ形式

### Supabaseテーブル構造

#### `meal_history` テーブル
- `date` (DATE): 日付（主キー）
- `user_name` (TEXT): ユーザー名
- `timestamp` (TIMESTAMPTZ): 記録日時
- `selected_menus` (JSONB): 選択したメニューリスト
- `settings` (JSONB): 設定情報
- `totals` (JSONB): 栄養合計
- `achievement` (JSONB): 達成度情報

#### `menus` テーブル（既存）
- `date` (DATE): 日付
- `menu_name` (TEXT): メニュー名
- `nutrition` (JSONB): 栄養情報

## 🎯 使い方

### フロントエンド（GitHub Pages）

デプロイされたページにアクセスして:
1. 日付を選択
2. メニューをJSON形式で入力
3. 「送信」ボタンをクリック

メニューJSON例:
```json
[
  {"type":"主菜","name":"から揚げ","nutrition":{"energy":300}},
  {"type":"副菜","name":"サラダ","nutrition":{"energy":50}}
]
```

### ローカル開発

1. `.env.example`を`.env`にコピーして値を設定:
```bash
cp .env.example .env
```

2. 依存関係をインストール:
```bash
npm install
```

3. データ移行スクリプトを実行:
```bash
npm run migrate
```

## �️ 技術スタック

- **フロントエンド**: HTML, JavaScript, Supabase JS Client
- **バックエンド**: Supabase (PostgreSQL)
- **デプロイ**: GitHub Actions + GitHub Pages
- **データ移行**: Node.js

## 📦 ディレクトリ構造

```
kyowa-menu-history/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actionsワークフロー
├── data/
│   ├── history/             # 旧形式の食事履歴JSONファイル
│   └── menus/               # 旧形式のメニューJSONファイル
├── scripts/
│   └── migrate-to-supabase.js  # データ移行スクリプト
├── supabase/
│   └── schema.sql           # データベーススキーマ
├── index.html               # メインページ
├── .env.example             # 環境変数テンプレート
└── README.md
```

## 🔄 開発フロー

1. ローカルで開発・テスト
2. mainブランチにプッシュ
3. GitHub Actionsが自動的にビルド＆デプロイ
4. GitHub Pagesで公開

---

**作成日**: 2026-01-20  
**管理者**: @1onotakanori-art
**更新日**: 2026-03-30 (Supabase統合)
