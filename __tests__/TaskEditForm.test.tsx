import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskEditForm from "@/components/TaskEditForm";
import type { Task } from "@/types/task";

const task: Task = {
  id: "task-1",
  title: "買い物に行く",
  description: "牛乳を買う",
  status: "todo",
};

const onSave = vi.fn();
const onCancel = vi.fn();

const renderForm = () => {
  const user = userEvent.setup();
  render(<TaskEditForm task={task} onSave={onSave} onCancel={onCancel} />);
  return user;
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("TaskEditForm", () => {
  it("タスクのタイトルと説明が入力欄の初期値として表示される", () => {
    renderForm();

    expect((screen.getByLabelText("タイトル") as HTMLInputElement).value).toBe("買い物に行く");
    expect((screen.getByLabelText("説明") as HTMLTextAreaElement).value).toBe("牛乳を買う");
  });

  it("編集して保存すると、前後の空白を除いたタイトルと説明が onSave に渡される", async () => {
    const user = renderForm();

    await user.clear(screen.getByLabelText("タイトル"));
    await user.type(screen.getByLabelText("タイトル"), "  本屋に行く  ");
    await user.clear(screen.getByLabelText("説明"));
    await user.type(screen.getByLabelText("説明"), "  雑誌を買う  ");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSave).toHaveBeenCalledWith({ title: "本屋に行く", description: "雑誌を買う" });
  });

  it("タイトルが100文字のとき、エラーにならず保存される", async () => {
    const user = renderForm();
    const title = "あ".repeat(100);

    await user.clear(screen.getByLabelText("タイトル"));
    await user.type(screen.getByLabelText("タイトル"), title);
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSave).toHaveBeenCalledWith({ title, description: "牛乳を買う" });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it.each([
    ["空", "", "タイトルを入力してください"],
    ["101文字", "あ".repeat(101), "タイトルは100文字以内で入力してください"],
  ])("タイトルが%sのとき、エラーが表示され保存されない", async (_label, title, message) => {
    const user = renderForm();

    await user.clear(screen.getByLabelText("タイトル"));
    if (title) await user.type(screen.getByLabelText("タイトル"), title);
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(screen.getByRole("alert").textContent).toBe(message);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("キャンセルを押すと onCancel が呼ばれ、保存はされない", async () => {
    const user = renderForm();

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });
});
