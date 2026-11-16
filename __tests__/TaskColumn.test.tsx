import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskColumn from "@/components/TaskColumn";
import type { Task } from "@/types/task";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "買い物に行く",
  description: "牛乳を買う",
  status: "in_progress",
  ...overrides,
});

const onUpdate = vi.fn();
const onDeleteRequest = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
});

describe("TaskColumn", () => {
  it("ステータスの表示名を見出しにした領域として表示される", () => {
    render(
      <TaskColumn status="in_progress" tasks={[]} onUpdate={onUpdate} onDeleteRequest={onDeleteRequest} />,
    );

    expect(screen.getByRole("region", { name: "In Progress" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "In Progress" })).toBeDefined();
  });

  it("渡したタスクがカードとして表示され、件数が表示される", () => {
    render(
      <TaskColumn
        status="in_progress"
        tasks={[makeTask({ id: "1", title: "タスクA" }), makeTask({ id: "2", title: "タスクB" })]}
        onUpdate={onUpdate}
        onDeleteRequest={onDeleteRequest}
      />,
    );

    const column = screen.getByRole("region", { name: "In Progress" });
    expect(within(column).getByRole("article", { name: "タスクA" })).toBeDefined();
    expect(within(column).getByRole("article", { name: "タスクB" })).toBeDefined();
    expect(within(column).getByText("2件")).toBeDefined();
    expect(within(column).queryByText("タスクはありません")).toBeNull();
  });

  it("タスクが0件のとき、空状態のメッセージと0件が表示される", () => {
    render(
      <TaskColumn status="done" tasks={[]} onUpdate={onUpdate} onDeleteRequest={onDeleteRequest} />,
    );

    const column = screen.getByRole("region", { name: "Done" });
    expect(within(column).getByText("タスクはありません")).toBeDefined();
    expect(within(column).getByText("0件")).toBeDefined();
    expect(within(column).queryByRole("article")).toBeNull();
  });

  it("カードの削除ボタンを押すと、そのタスクで削除が要求される", async () => {
    const user = userEvent.setup();
    const task = makeTask();
    render(
      <TaskColumn status="in_progress" tasks={[task]} onUpdate={onUpdate} onDeleteRequest={onDeleteRequest} />,
    );

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(onDeleteRequest).toHaveBeenCalledWith(task);
  });
});
