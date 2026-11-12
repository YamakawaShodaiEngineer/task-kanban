# task-kanban

## 概要
タスク管理カンバン。タスクの追加・編集・削除・一覧表示と
ステータス管理（Todo / In Progress / Done）ができる。
Next.js + Supabaseで構築し、Vercelにデプロイする。

## 技術スタック
- Next.js（AppRouter）
- TypeScript
- Supabase（データベース）
- Vitest + Testing Library（テスト）
- Vercel（デプロイ）

## ディレクトリ構成
 src/
 ├── app/                            # ページとレイアウト
 │      ├──page.tsx                  # トップページ
 │      ├──layout.tsx                # 共通レイアウト
 │      └──globals.css               # グローバルスタイル
 ├── lib/
 │      ├──supabase.ts               # Supabaseクライアント（共通インスタンス）
 │      └──checkSupabaseConnection.ts # Supabase接続確認
 └── instrumentation.ts              # サーバー起動時処理（Supabase接続確認）

## Supabase
- プロジェクト名：`task-kanban`（MCPで参照する際はこのプロジェクトを使用。`mcp-practice`と間違えないこと）
- 環境変数：キー名は`.env.example`を参照し、実際の値は`.env.local`に記載する（`.env.local`はコミットしない）
  - `NEXT_PUBLIC_SUPABASE_URL`：プロジェクトURL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`：Publishableキー（`sb_publishable_...`）。レガシーのanonキーやsecretキーは使用しない
- DBアクセスは`src/lib/supabase.ts`の`supabase`をimportして行い、個別に`createClient`しないでください
- サーバー起動時に`src/instrumentation.ts`が接続確認を行い、失敗時のみ`console.error`でログを出力する（成功時は出力しない）
- テストではSupabaseへの通信（`fetch`やクライアント）を外部依存としてモック化してください

## コーディングルール
- 変更後は必ず`npm test`でテストが通ることを確認してください
- 変更は1つの関心事に絞り、小さい単位で行ってください
- 指示された範囲以外のコードを変更しないでください

## コーディング規約
- コンポーネントは関数コンポーネントで記述してください
- 変数名・関数名はキャメルケースで書いてください
- コミットメッセージは日本語で書いてください

## テストルール
- 網羅性：正常系・異常系・境界値を検討してください
- 可読性：テスト名に条件と期待する結果を明示してください
- 保守性：実装の内部構造でなくユーザーから見た振る舞いをテストをしてください
- 独立性：テスト間で状態を共有しないでください
- 状態遷移：画面遷移の順報告・逆方向を検証してください
- モック方針：外部依存のみモック化してください

## 禁止事項
- console.logを本番コードに残さないでください
- 既存のテストを削除しないでください
- any型を使用しないでください

## MCP活用ルール
- Next.js・Supabase・Vitestなどの最新仕様はContext7 MCPを使って公式ドキュメントを確認してください