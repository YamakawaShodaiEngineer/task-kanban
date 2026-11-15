import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskBoard from "@/components/TaskBoard";
import type { Task } from "@/types/task";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "@/lib/taskRepository";

// Supabase（外部依存）へのアクセス層のみモックする
vi.mock("@/lib/taskRepository", () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "買い物に行く",
  description: "牛乳を買う",
  status: "todo",
  ...overrides,
});

const renderBoard = async (tasks: Task[]) => {
  vi.mocked(fetchTasks).mockResolvedValue(tasks);
  const user = userEvent.setup();
  render(<TaskBoard />);
  // 読み込み完了（列が表示される）まで待つ
  await screen.findByRole("region", { name: "Todo" });
  return user;
};

const column = (name: "Todo" | "In Progress" | "Done") =>
  screen.getByRole("region", { name });

const addForm = () => screen.getByRole("form", { name: "タスクの追加" });

beforeEach(() => {
  vi.resetAllMocks();
});

describe("一覧表示", () => {
  it("取得したタスクがステータスに対応する列に表示される", async () => {
    await renderBoard([
      makeTask({ id: "1", title: "タスクA", status: "todo" }),
      makeTask({ id: "2", title: "タスクB", status: "in_progress" }),
      makeTask({ id: "3", title: "タスクC", status: "done" }),
    ]);

    expect(within(column("Todo")).getByText("タスクA")).toBeDefined();
    expect(within(column("In Progress")).getByText("タスクB")).toBeDefined();
    expect(within(column("Done")).getByText("タスクC")).toBeDefined();
  });

  it("タスクが0件の列には「タスクはありません」と表示される", async () => {
    await renderBoard([makeTask({ status: "todo" })]);

    expect(within(column("Todo")).queryByText("タスクはありません")).toBeNull();
    expect(
      within(column("In Progress")).getByText("タスクはありません"),
    ).toBeDefined();
    expect(within(column("Done")).getByText("タスクはありません")).toBeDefined();
  });

  it("各列に、その列のタスク件数が表示される（0件の列は0件）", async () => {
    await renderBoard([
      makeTask({ id: "1", title: "タスクA", status: "todo" }),
      makeTask({ id: "2", title: "タスクB", status: "todo" }),
      makeTask({ id: "3", title: "タスクC", status: "done" }),
    ]);

    expect(within(column("Todo")).getByText("2件")).toBeDefined();
    expect(within(column("In Progress")).getByText("0件")).toBeDefined();
    expect(within(column("Done")).getByText("1件")).toBeDefined();
  });

  it("ステータスを変更すると、移動元と移動先の列の件数が更新される", async () => {
    const user = await renderBoard([makeTask({ status: "todo" })]);
    vi.mocked(updateTask).mockResolvedValue(makeTask({ status: "in_progress" }));

    await user.selectOptions(
      within(column("Todo")).getByLabelText("ステータス"),
      "in_progress",
    );

    expect(await within(column("In Progress")).findByText("1件")).toBeDefined();
    expect(within(column("Todo")).getByText("0件")).toBeDefined();
  });

  it("タスクの取得に失敗したとき、エラーメッセージが表示される", async () => {
    vi.mocked(fetchTasks).mockRejectedValue(new Error("network error"));
    render(<TaskBoard />);

    expect((await screen.findByRole("alert")).textContent).toContain(
      "タスクの取得に失敗しました",
    );
  });
});

describe("追加", () => {
  it("タイトルと説明を入力して追加すると、Todo列に表示され入力欄が空になる", async () => {
    const user = await renderBoard([]);
    vi.mocked(createTask).mockResolvedValue(
      makeTask({ id: "new", title: "新しいタスク", description: "詳細" }),
    );

    await user.type(within(addForm()).getByLabelText("タイトル"), "新しいタスク");
    await user.type(within(addForm()).getByLabelText("説明"), "詳細");
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(createTask).toHaveBeenCalledWith({
      title: "新しいタスク",
      description: "詳細",
    });
    expect(
      await within(column("Todo")).findByText("新しいタスク"),
    ).toBeDefined();
    expect(
      (within(addForm()).getByLabelText("タイトル") as HTMLInputElement).value,
    ).toBe("");
  });

  it("タイトルの前後の空白は取り除いて登録される", async () => {
    const user = await renderBoard([]);
    vi.mocked(createTask).mockResolvedValue(makeTask({ title: "タスク" }));

    await user.type(within(addForm()).getByLabelText("タイトル"), "  タスク  ");
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(createTask).toHaveBeenCalledWith({ title: "タスク", description: "" });
  });

  it.each([
    ["空文字", ""],
    ["空白のみ", "   "],
  ])("タイトルが%sのとき、エラーが表示され登録されない", async (_label, title) => {
    const user = await renderBoard([]);

    if (title) {
      await user.type(within(addForm()).getByLabelText("タイトル"), title);
    }
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(within(addForm()).getByRole("alert").textContent).toBe(
      "タイトルを入力してください",
    );
    expect(createTask).not.toHaveBeenCalled();
  });

  it("タイトルが100文字のとき、登録できる", async () => {
    const user = await renderBoard([]);
    const title = "あ".repeat(100);
    vi.mocked(createTask).mockResolvedValue(makeTask({ title }));

    await user.type(within(addForm()).getByLabelText("タイトル"), title);
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(createTask).toHaveBeenCalledWith({ title, description: "" });
    expect(within(addForm()).queryByRole("alert")).toBeNull();
  });

  it("タイトルが101文字のとき、エラーが表示され登録されない", async () => {
    const user = await renderBoard([]);

    await user.type(
      within(addForm()).getByLabelText("タイトル"),
      "あ".repeat(101),
    );
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(within(addForm()).getByRole("alert").textContent).toBe(
      "タイトルは100文字以内で入力してください",
    );
    expect(createTask).not.toHaveBeenCalled();
  });

  it("登録に失敗したとき、エラーが表示され入力値が保持される", async () => {
    const user = await renderBoard([]);
    vi.mocked(createTask).mockRejectedValue(new Error("network error"));

    await user.type(within(addForm()).getByLabelText("タイトル"), "失敗するタスク");
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "タスクの追加に失敗しました",
    );
    expect(
      (within(addForm()).getByLabelText("タイトル") as HTMLInputElement).value,
    ).toBe("失敗するタスク");
  });
});

describe("編集", () => {
  it("タイトルと説明を編集して保存すると、更新後の内容が表示される", async () => {
    const user = await renderBoard([makeTask()]);
    vi.mocked(updateTask).mockResolvedValue(
      makeTask({ title: "本屋に行く", description: "雑誌を買う" }),
    );
    const card = screen.getByRole("article", { name: "買い物に行く" });

    await user.click(within(card).getByRole("button", { name: "編集" }));
    const titleInput = within(card).getByLabelText("タイトル");
    await user.clear(titleInput);
    await user.type(titleInput, "本屋に行く");
    const descriptionInput = within(card).getByLabelText("説明");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "雑誌を買う");
    await user.click(within(card).getByRole("button", { name: "保存" }));

    expect(updateTask).toHaveBeenCalledWith("task-1", {
      title: "本屋に行く",
      description: "雑誌を買う",
    });
    const updatedCard = await screen.findByRole("article", { name: "本屋に行く" });
    expect(within(updatedCard).getByText("雑誌を買う")).toBeDefined();
  });

  it("編集をキャンセルすると、元の内容のまま表示される", async () => {
    const user = await renderBoard([makeTask()]);
    const card = screen.getByRole("article", { name: "買い物に行く" });

    await user.click(within(card).getByRole("button", { name: "編集" }));
    await user.clear(within(card).getByLabelText("タイトル"));
    await user.type(within(card).getByLabelText("タイトル"), "変更途中");
    await user.click(within(card).getByRole("button", { name: "キャンセル" }));

    expect(updateTask).not.toHaveBeenCalled();
    expect(screen.getByRole("article", { name: "買い物に行く" })).toBeDefined();
    expect(screen.getByText("牛乳を買う")).toBeDefined();
  });

  it("タイトルを空にして保存すると、エラーが表示され更新されない", async () => {
    const user = await renderBoard([makeTask()]);
    const card = screen.getByRole("article", { name: "買い物に行く" });

    await user.click(within(card).getByRole("button", { name: "編集" }));
    await user.clear(within(card).getByLabelText("タイトル"));
    await user.click(within(card).getByRole("button", { name: "保存" }));

    expect(within(card).getByRole("alert").textContent).toBe(
      "タイトルを入力してください",
    );
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("更新に失敗したとき、エラーが表示され元の内容が残る", async () => {
    const user = await renderBoard([makeTask()]);
    vi.mocked(updateTask).mockRejectedValue(new Error("network error"));
    const card = screen.getByRole("article", { name: "買い物に行く" });

    await user.selectOptions(within(card).getByLabelText("ステータス"), "done");

    expect((await screen.findByRole("alert")).textContent).toContain(
      "タスクの更新に失敗しました",
    );
    expect(within(column("Todo")).getByText("買い物に行く")).toBeDefined();
  });
});

describe("ステータス遷移", () => {
  it("Todo → In Progress → Done の順に変更すると、対応する列に移動する", async () => {
    const user = await renderBoard([makeTask({ status: "todo" })]);
    vi.mocked(updateTask)
      .mockResolvedValueOnce(makeTask({ status: "in_progress" }))
      .mockResolvedValueOnce(makeTask({ status: "done" }));

    await user.selectOptions(
      within(column("Todo")).getByLabelText("ステータス"),
      "in_progress",
    );
    expect(
      await within(column("In Progress")).findByText("買い物に行く"),
    ).toBeDefined();
    expect(within(column("Todo")).queryByText("買い物に行く")).toBeNull();

    await user.selectOptions(
      within(column("In Progress")).getByLabelText("ステータス"),
      "done",
    );
    expect(await within(column("Done")).findByText("買い物に行く")).toBeDefined();
    expect(within(column("In Progress")).queryByText("買い物に行く")).toBeNull();

    expect(updateTask).toHaveBeenNthCalledWith(1, "task-1", {
      status: "in_progress",
    });
    expect(updateTask).toHaveBeenNthCalledWith(2, "task-1", { status: "done" });
  });

  it("Done → In Progress → Todo の逆順に変更すると、対応する列に移動する", async () => {
    const user = await renderBoard([makeTask({ status: "done" })]);
    vi.mocked(updateTask)
      .mockResolvedValueOnce(makeTask({ status: "in_progress" }))
      .mockResolvedValueOnce(makeTask({ status: "todo" }));

    await user.selectOptions(
      within(column("Done")).getByLabelText("ステータス"),
      "in_progress",
    );
    expect(
      await within(column("In Progress")).findByText("買い物に行く"),
    ).toBeDefined();
    expect(within(column("Done")).queryByText("買い物に行く")).toBeNull();

    await user.selectOptions(
      within(column("In Progress")).getByLabelText("ステータス"),
      "todo",
    );
    expect(await within(column("Todo")).findByText("買い物に行く")).toBeDefined();
    expect(within(column("In Progress")).queryByText("買い物に行く")).toBeNull();
  });
});

describe("削除", () => {
  it("削除ボタンを押すと、タスク名を含む確認ダイアログが表示される", async () => {
    const user = await renderBoard([makeTask()]);

    await user.click(screen.getByRole("button", { name: "削除" }));

    const dialog = screen.getByRole("dialog", { name: "タスクの削除" });
    expect(within(dialog).getByText("「買い物に行く」を削除しますか？")).toBeDefined();
    expect(deleteTask).not.toHaveBeenCalled();
  });

  it("確認ダイアログでキャンセルすると、ダイアログが閉じタスクが残る", async () => {
    const user = await renderBoard([makeTask()]);

    await user.click(screen.getByRole("button", { name: "削除" }));
    const dialog = screen.getByRole("dialog", { name: "タスクの削除" });
    await user.click(within(dialog).getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(deleteTask).not.toHaveBeenCalled();
    expect(within(column("Todo")).getByText("買い物に行く")).toBeDefined();
  });

  it("確認ダイアログで削除を確定すると、タスクが一覧から消える", async () => {
    const user = await renderBoard([makeTask()]);
    vi.mocked(deleteTask).mockResolvedValue(undefined);

    await user.click(screen.getByRole("button", { name: "削除" }));
    const dialog = screen.getByRole("dialog", { name: "タスクの削除" });
    await user.click(within(dialog).getByRole("button", { name: "削除する" }));

    expect(deleteTask).toHaveBeenCalledWith("task-1");
    expect(await within(column("Todo")).findByText("タスクはありません")).toBeDefined();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("削除に失敗したとき、エラーが表示されタスクが残る", async () => {
    const user = await renderBoard([makeTask()]);
    vi.mocked(deleteTask).mockRejectedValue(new Error("network error"));

    await user.click(screen.getByRole("button", { name: "削除" }));
    const dialog = screen.getByRole("dialog", { name: "タスクの削除" });
    await user.click(within(dialog).getByRole("button", { name: "削除する" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "タスクの削除に失敗しました",
    );
    expect(within(column("Todo")).getByText("買い物に行く")).toBeDefined();
  });
});
