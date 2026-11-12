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
 ├── components/                     # UIコンポーネント（クライアントコンポーネント）
 │      ├──TaskBoard.tsx             # カンバン全体（取得・状態管理・3列表示）
 │      ├──TaskForm.tsx              # タスク追加フォーム
 │      ├──TaskCard.tsx              # タスク表示・編集・ステータス変更
 │      └──ConfirmDialog.tsx         # 確認ダイアログ（削除確認）
 ├── lib/
 │      ├──supabase.ts               # Supabaseクライアント（共通インスタンス）
 │      ├──taskRepository.ts         # tasksテーブルのCRUD（Supabaseアクセスはここに集約）
 │      ├──validateTaskTitle.ts      # タイトルの入力検証
 │      └──checkSupabaseConnection.ts # Supabase接続確認
 ├── types/
 │      ├──database.ts               # Supabase MCPで生成したDB型（手動編集しない）
 │      └──task.ts                   # Task型・ステータス定義
 └── instrumentation.ts              # サーバー起動時処理（Supabase接続確認）
 supabase/migrations/                # 適用済みマイグレーションSQL
 __tests__/                          # テスト

## Supabase
- プロジェクト名：`task-kanban`（MCPで参照する際はこのプロジェクトを使用。`mcp-practice`と間違えないこと）
- 環境変数：キー名は`.env.example`を参照し、実際の値は`.env.local`に記載する（`.env.local`はコミットしない）
  - `NEXT_PUBLIC_SUPABASE_URL`：プロジェクトURL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`：Publishableキー（`sb_publishable_...`）。レガシーのanonキーやsecretキーは使用しない
- DBアクセスは`src/lib/supabase.ts`の`supabase`をimportして行い、個別に`createClient`しないでください
- サーバー起動時に`src/instrumentation.ts`が接続確認を行い、失敗時のみ`console.error`でログを出力する（成功時は出力しない）
- テストではSupabaseへの通信（`fetch`やクライアント）を外部依存としてモック化してください
  - 画面のテストでは`@/lib/taskRepository`を`vi.mock`のファクトリ関数でモックする（自動モックは`supabase.ts`を読み込み環境変数エラーになるため不可）

### tasksテーブル
| カラム | 型 | 制約 |
|---|---|---|
| id | uuid | PK、`gen_random_uuid()` |
| title | text | 必須、前後空白を除き1〜100文字 |
| description | text | 既定値`''`、1000文字以内 |
| status | text | `todo` / `in_progress` / `done`（既定値`todo`） |
| created_at / updated_at | timestamptz | `updated_at`はトリガーで自動更新 |

- RLS有効。認証未導入のため anon / authenticated に全CRUDを許可している（認証導入時に見直すこと）
- 入力値の制約はDB（CHECK制約）と画面（`validateTaskTitle`など）の両方で同じ値にそろえてください

### スキーマ変更の手順
1. Supabase MCPの`apply_migration`でSQLを適用し、同じSQLを`supabase/migrations/<タイムスタンプ>_<名前>.sql`に保存する
2. `get_advisors`（security / performance）で警告がないか確認する
3. `generate_typescript_types`で`src/types/database.ts`を再生成する
4. `src/types/task.ts`の型と、`src/lib/taskRepository.ts`の`select`対象カラム（`columns`）を更新する

## 実装方針（カンバン機能）
- 画面はクライアントコンポーネントで、ブラウザから直接Supabaseを操作する（Server Actionsは使っていない）
- Supabaseへのアクセスは`src/lib/taskRepository.ts`の関数（`fetchTasks` / `createTask` / `updateTask` / `deleteTask`）経由に限定し、コンポーネントから`supabase`を直接呼ばないでください
  - Supabaseのエラーは例外に変換して投げ、DBの行は`Task`型に変換して返す
- タスクの状態は`TaskBoard`が一元管理し、子コンポーネントには更新関数を渡す
- 追加・編集・削除の結果は、Supabaseの応答を待ってから一覧に反映する（楽観的更新はしない）
  - 応答で返ったタスクで状態を更新し、一覧の再取得やページリロードはしない
  - 失敗時は一覧を変更せず、画面上部にエラーメッセージ（`role="alert"`）を表示する
- 削除は必ず`ConfirmDialog`で確認してから実行する（`window.confirm`は使わない）
- ステータス値（`todo`など）と表示名（`Todo`など）は`src/types/task.ts`の`taskStatuses` / `taskStatusLabels`を使い、文字列を直書きしないでください

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
- テストの進め方：仕様を満たすテストを先に書いて失敗を確認し、その後テストが通るように実装してください（TDD）
- 操作は`@testing-library/user-event`で行い、要素はrole・ラベル・表示テキストで取得してください（クラス名やtestidに頼らない）
  - そのため、UIには適切なroleとラベルを付けてください（列は見出し付き`section`、タスクは`article`、ダイアログは`role="dialog"`）
- `beforeEach`で`vi.resetAllMocks()`し、各テストでモックの戻り値を設定してください

## 禁止事項
- console.logを本番コードに残さないでください
- 既存のテストを削除しないでください
- any型を使用しないでください

## MCP活用ルール
- Next.js・Supabase・Vitestなどの最新仕様はContext7 MCPを使って公式ドキュメントを確認してください