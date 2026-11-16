import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTaskDraft } from "@/hooks/useTaskDraft";
import type { NewTask } from "@/types/task";

describe("useTaskDraft", () => {
  it("初期値を省略すると、タイトルと説明は空でエラーも無い", () => {
    const { result } = renderHook(() => useTaskDraft());

    expect(result.current.title).toBe("");
    expect(result.current.description).toBe("");
    expect(result.current.validationError).toBeNull();
  });

  it("初期値を渡すと、その値で始まる", () => {
    const { result } = renderHook(() =>
      useTaskDraft({ title: "買い物に行く", description: "牛乳を買う" }),
    );

    expect(result.current.title).toBe("買い物に行く");
    expect(result.current.description).toBe("牛乳を買う");
  });

  it("入力が正しいとき、validate は前後の空白を除いた値を返しエラーは無い", () => {
    const { result } = renderHook(() => useTaskDraft());
    act(() => {
      result.current.setTitle("  タスク  ");
      result.current.setDescription("  詳細  ");
    });

    let validated: NewTask | null = null;
    act(() => {
      validated = result.current.validate();
    });

    expect(validated).toEqual({ title: "タスク", description: "詳細" });
    expect(result.current.validationError).toBeNull();
  });

  it.each([
    ["空白のみ", "   ", "タイトルを入力してください"],
    ["101文字", "あ".repeat(101), "タイトルは100文字以内で入力してください"],
  ])("タイトルが%sのとき、validate は null を返しエラーが設定される", (_label, title, message) => {
    const { result } = renderHook(() => useTaskDraft());
    act(() => {
      result.current.setTitle(title);
    });

    let validated: NewTask | null = { title: "", description: "" };
    act(() => {
      validated = result.current.validate();
    });

    expect(validated).toBeNull();
    expect(result.current.validationError).toBe(message);
  });

  it("エラーの後に正しく入力して validate すると、エラーが消える", () => {
    const { result } = renderHook(() => useTaskDraft());
    act(() => {
      result.current.validate();
    });
    expect(result.current.validationError).toBe("タイトルを入力してください");

    act(() => {
      result.current.setTitle("タスク");
    });
    act(() => {
      result.current.validate();
    });

    expect(result.current.validationError).toBeNull();
  });

  it("reset すると、タイトルと説明が空に戻る", () => {
    const { result } = renderHook(() => useTaskDraft());
    act(() => {
      result.current.setTitle("タスク");
      result.current.setDescription("詳細");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.title).toBe("");
    expect(result.current.description).toBe("");
  });
});
