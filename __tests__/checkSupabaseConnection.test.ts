import { afterEach, describe, expect, it, vi } from "vitest";
import { checkSupabaseConnection } from "@/lib/checkSupabaseConnection";

const url = "https://example.supabase.co";
const key = "sb_publishable_test";

describe("checkSupabaseConnection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ヘルスチェックが200を返すとき、接続成功を返す", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await checkSupabaseConnection(url, key);

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(`${url}/auth/v1/health`, {
      headers: { apikey: key },
    });
  });

  it("ヘルスチェックが401を返すとき、ステータスコード付きで接続失敗を返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 401 })));

    const result = await checkSupabaseConnection(url, key);

    expect(result).toEqual({ ok: false, reason: "HTTP 401" });
  });

  it("通信エラーが発生したとき、エラーメッセージ付きで接続失敗を返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fetch failed")));

    const result = await checkSupabaseConnection(url, key);

    expect(result).toEqual({ ok: false, reason: "fetch failed" });
  });

  it.each([
    ["URLが未設定", undefined, key],
    ["キーが未設定", url, undefined],
    ["URLが空文字", "", key],
  ])("%sのとき、通信せずに接続失敗を返す", async (_label, u, k) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await checkSupabaseConnection(u, k);

    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
