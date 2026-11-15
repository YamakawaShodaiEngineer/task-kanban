export type SupabaseConnectionResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Supabase の Auth ヘルスチェックエンドポイントに問い合わせ、接続できるかを確認する。
 * テーブルの有無に依存せず、URL とキーが正しいかを判定できる。
 */
export async function checkSupabaseConnection(
  url: string | undefined,
  publishableKey: string | undefined,
): Promise<SupabaseConnectionResult> {
  if (!url || !publishableKey) {
    return {
      ok: false,
      reason:
        "環境変数 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY が未設定です",
    };
  }

  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: publishableKey },
    });
    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: message };
  }
}
