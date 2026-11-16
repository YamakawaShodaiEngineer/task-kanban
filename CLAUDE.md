# task-kanban

## 概要
タスク管理カンバン。タスクの追加・編集・削除・一覧表示と
ステータス管理（Todo / In Progress / Done）ができる。
Next.js + Supabaseで構築し、Vercelにデプロイする。

## 技術スタック
- Next.js（AppRouter）
- TypeScript
- Supabase（データベース）
- Tailwind CSS v4 + shadcn/ui（UIコンポーネント。Radixベース、スタイル`radix-nova`、アイコンは`lucide-react`）
- Vitest + Testing Library（テスト）
- Vercel（デプロイ）

## ディレクトリ構成
 src/
 ├── app/                            # ページとレイアウト
 │      ├──page.tsx                  # トップページ
 │      ├──layout.tsx                # 共通レイアウト
 │      └──globals.css               # グローバルスタイル（shadcn/uiのテーマ用CSS変数を含む）
 ├── components/                     # UIコンポーネント（クライアントコンポーネント）
 │      ├──ui/                       # shadcn/uiのCLIで追加したコンポーネント
 │      ├──TaskBoard.tsx             # カンバン全体（エラー表示・3列の配置・削除確認）
 │      ├──BoardSkeleton.tsx         # 読み込み中の表示
 │      ├──TaskColumn.tsx            # ステータスごとの列（見出し・件数・空状態）
 │      ├──TaskForm.tsx              # タスク追加フォーム
 │      ├──TaskCard.tsx              # タスク表示・ステータス変更（編集時はTaskEditFormに切り替え）
 │      ├──TaskEditForm.tsx          # タスクの編集フォーム
 │      ├──TaskTitleField.tsx        # タイトル入力欄（検証エラー表示とaria紐付け）
 │      ├──ConfirmDialog.tsx         # 確認ダイアログ（削除確認）
 │      ├──ThemeProvider.tsx         # next-themesのプロバイダー（ダークモード）
 │      └──ThemeToggle.tsx           # ライト／ダークの切り替えボタン
 ├── hooks/
 │      ├──useTasks.ts               # タスク一覧の取得・追加・更新・削除とエラー状態の管理
 │      └──useTaskDraft.ts           # 入力途中のタイトル・説明と検証
 ├── lib/
 │      ├──supabase.ts               # Supabaseクライアント（共通インスタンス）
 │      ├──taskRepository.ts         # tasksテーブルのCRUD（Supabaseアクセスはここに集約）
 │      ├──validateTaskTitle.ts      # タイトルの入力検証
 │      ├──checkSupabaseConnection.ts # Supabase接続確認
 │      └──utils.ts                  # shadcn/uiの`cn`（`cn`パッケージの再エクスポート）
 ├── types/
 │      ├──database.ts               # Supabase MCPで生成したDB型（手動編集しない）
 │      └──task.ts                   # Task型・ステータス定義
 └── instrumentation.ts              # サーバー起動時処理（Supabase接続確認）
 components.json                     # shadcn/uiの設定
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

## UI（shadcn/ui）
- コンポーネントは`npx shadcn@latest add <名前>`で`src/components/ui/`に追加する（手書きでコピーしない）
- 新しいUIはまず既存のshadcn/uiコンポーネントで組めないか検討し、色は`bg-primary`や`text-muted-foreground`などテーマのトークンを使う（`text-zinc-500`などの直書きは避ける）
- クラス名の結合は`@/lib/utils`の`cn`を使う
- テーマの色・角丸は`globals.css`のCSS変数（`:root` / `.dark`）で調整する
- shadcn/uiを使っても、テストルールのrole・ラベル（列は`section`、タスクは`article`、ダイアログは`role="dialog"`）は維持する

### デザインルール
**コンポーネントの使い分け**
| 用途 | 使うもの | 補足 |
|---|---|---|
| フォーム・タスクの囲み | `Card`（タスクは`size="sm"`） | タスクは`<article aria-label>`で`Card`を包む |
| 入力欄 | `Label` + `Input` / `Textarea` | `useId`で`htmlFor`と`id`を紐付ける |
| ステータス選択 | `NativeSelect` | Radixの`Select`は使わない（テストの`selectOptions`がネイティブselect前提） |
| 確認ダイアログ | `Dialog` | `AlertDialog`は使わない（roleが`alertdialog`になる）。`DialogTitle`で名前を付ける |
| 画面上部のエラー | `Alert variant="destructive"` | `role="alert"`はコンポーネントが付与する |
| 件数表示 | `Badge variant="secondary"` | 列見出し（`h2`）の**外**に置く（中に入れると列の名前が変わる） |
| 読み込み中 | `Skeleton` | `role="status"`と`sr-only`の「読み込み中...」を付ける |

**ボタン**
- 主要な操作（追加・保存）：`variant="default"`。アイコンを付けるときは`lucide-react`のアイコンに`data-icon="inline-start"`
- 補助的な操作（キャンセル）：`variant="outline"`
- 破壊的な操作（削除の確定）：`variant="destructive"`
- カード内の操作（編集・削除）：`variant="ghost" size="icon-sm"`のアイコンボタン。テキストが無いので必ず`aria-label`と`title`を付ける

**色**
- テーマのトークン（`background` / `foreground` / `muted` / `muted-foreground` / `primary` / `destructive` / `border`）だけを使い、Tailwindの色名（`zinc`・`red`・`blue`など）は直書きしない
- ステータス色は`bg-status-todo` / `bg-status-in-progress` / `bg-status-done`を使う。色を追加・変更するときは`globals.css`の`:root`と`.dark`の両方、および`@theme inline`の`--color-*`を更新する
- エラー文言は`text-destructive`、補足文・説明文・空状態は`text-muted-foreground`

**レイアウト・余白**
- ページ幅は`mx-auto max-w-6xl px-4`。ヘッダーは`sticky`で`bg-background/80`＋`backdrop-blur`
- 列は`grid-cols-1 md:grid-cols-3`、各列は`rounded-xl bg-muted/50 p-3`のパネル
- 空状態は破線枠（`border border-dashed`）の中に中央寄せで表示する
- 余白は`gap-*`で取り、要素間は主に`gap-2`（項目内）／`gap-3`〜`gap-4`（要素間）／`gap-6`（ブロック間）

**フォーム・エラー表示**
- 検証エラーは入力欄の直下に`<p role="alert" className="text-sm text-destructive">`で表示し、入力欄に`aria-invalid`と`aria-describedby`を付ける（赤枠はコンポーネントが表示する）

**アクセシビリティ**
- 装飾目的のアイコンや色ドットには`aria-hidden="true"`を付ける
- 見た目のラベルを省く場合も`Label`に`sr-only`を付けて残す（例：カードのステータス選択）

**ダークモード**
- `next-themes`（`ThemeProvider` / `ThemeToggle`）で`.dark`クラスを切り替える。`prefers-color-scheme`を直接使わない
- トークンを使えば自動で対応するため、`dark:`バリアントは原則書かない（テーマ切り替えアイコンのような例外のみ）
- サーバー描画との不一致を避けるため、テーマで表示を変える場合は`useTheme`の値ではなくCSS（`dark:`）で切り替える

**デザイン変更後の確認**
- Playwright MCPでデスクトップ（1280px）とモバイル（390px）、ライトとダークの4パターンを確認し、横スクロールが出ないことを確かめる
- スクリーンショットは`.playwright-mcp/`に保存する（Playwright MCPはプロジェクト外に保存できない）
- 起動中の開発サーバーが古いCSSを配信することがあるため、反映されない場合は開発サーバーを再起動する

## 実装方針（カンバン機能）
- 画面はクライアントコンポーネントで、ブラウザから直接Supabaseを操作する（Server Actionsは使っていない）
- Supabaseへのアクセスは`src/lib/taskRepository.ts`の関数（`fetchTasks` / `createTask` / `updateTask` / `deleteTask`）経由に限定し、コンポーネントから`supabase`を直接呼ばないでください
  - Supabaseのエラーは例外に変換して投げ、DBの行は`Task`型に変換して返す
- タスクの状態は`TaskBoard`が`useTasks`フックで一元管理し、子コンポーネントには更新関数を渡す
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