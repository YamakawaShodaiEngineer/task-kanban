import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useTasks } from "@/hooks/useTasks";
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

/** 取得が完了した状態のフックを返す */
const renderLoaded = async (tasks: Task[]) => {
  vi.mocked(fetchTasks).mockResolvedValue(tasks);
  const hook = renderHook(() => useTasks());
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("取得", () => {
  it("取得中は isLoading が true で、完了するとタスクが設定され false になる", async () => {
    const tasks = [makeTask()];
    vi.mocked(fetchTasks).mockResolvedValue(tasks);

    const { result } = renderHook(() => useTasks());
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tasks).toEqual(tasks);
    expect(result.current.errorMessage).toBeNull();
  });

  it("取得に失敗したとき、エラーメッセージが設定されタスクは空のまま", async () => {
    vi.mocked(fetchTasks).mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorMessage).toBe("タスクの取得に失敗しました");
    expect(result.current.tasks).toEqual([]);
  });
});

describe("追加", () => {
  it("追加に成功すると、応答のタスクが末尾に加わり true を返す", async () => {
    const existing = makeTask({ id: "1" });
    const created = makeTask({ id: "2", title: "新しいタスク" });
    const { result } = await renderLoaded([existing]);
    vi.mocked(createTask).mockResolvedValue(created);

    let succeeded = false;
    await act(async () => {
      succeeded = await result.current.addTask({ title: "新しいタスク", description: "" });
    });

    expect(succeeded).toBe(true);
    expect(createTask).toHaveBeenCalledWith({ title: "新しいタスク", description: "" });
    expect(result.current.tasks).toEqual([existing, created]);
  });

  it("追加に失敗すると、一覧は変わらずエラーメッセージが設定され false を返す", async () => {
    const existing = makeTask();
    const { result } = await renderLoaded([existing]);
    vi.mocked(createTask).mockRejectedValue(new Error("network error"));

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.addTask({ title: "失敗", description: "" });
    });

    expect(succeeded).toBe(false);
    expect(result.current.tasks).toEqual([existing]);
    expect(result.current.errorMessage).toBe("タスクの追加に失敗しました");
  });
});

describe("更新", () => {
  it("更新に成功すると、対象のタスクだけが応答の内容に置き換わり true を返す", async () => {
    const target = makeTask({ id: "1" });
    const other = makeTask({ id: "2", title: "別のタスク" });
    const updated = makeTask({ id: "1", status: "done" });
    const { result } = await renderLoaded([target, other]);
    vi.mocked(updateTask).mockResolvedValue(updated);

    let succeeded = false;
    await act(async () => {
      succeeded = await result.current.editTask("1", { status: "done" });
    });

    expect(succeeded).toBe(true);
    expect(updateTask).toHaveBeenCalledWith("1", { status: "done" });
    expect(result.current.tasks).toEqual([updated, other]);
  });

  it("更新に失敗すると、一覧は変わらずエラーメッセージが設定され false を返す", async () => {
    const target = makeTask();
    const { result } = await renderLoaded([target]);
    vi.mocked(updateTask).mockRejectedValue(new Error("network error"));

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.editTask("task-1", { status: "done" });
    });

    expect(succeeded).toBe(false);
    expect(result.current.tasks).toEqual([target]);
    expect(result.current.errorMessage).toBe("タスクの更新に失敗しました");
  });
});

describe("削除", () => {
  it("削除に成功すると、対象のタスクが一覧から消え true を返す", async () => {
    const target = makeTask({ id: "1" });
    const other = makeTask({ id: "2" });
    const { result } = await renderLoaded([target, other]);
    vi.mocked(deleteTask).mockResolvedValue(undefined);

    let succeeded = false;
    await act(async () => {
      succeeded = await result.current.removeTask("1");
    });

    expect(succeeded).toBe(true);
    expect(deleteTask).toHaveBeenCalledWith("1");
    expect(result.current.tasks).toEqual([other]);
  });

  it("削除に失敗すると、一覧は変わらずエラーメッセージが設定され false を返す", async () => {
    const target = makeTask();
    const { result } = await renderLoaded([target]);
    vi.mocked(deleteTask).mockRejectedValue(new Error("network error"));

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.removeTask("task-1");
    });

    expect(succeeded).toBe(false);
    expect(result.current.tasks).toEqual([target]);
    expect(result.current.errorMessage).toBe("タスクの削除に失敗しました");
  });
});

describe("エラーメッセージの解除", () => {
  it("失敗の後に操作が成功すると、エラーメッセージが消える", async () => {
    const { result } = await renderLoaded([]);
    vi.mocked(createTask)
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(makeTask());

    await act(async () => {
      await result.current.addTask({ title: "タスク", description: "" });
    });
    expect(result.current.errorMessage).toBe("タスクの追加に失敗しました");

    await act(async () => {
      await result.current.addTask({ title: "タスク", description: "" });
    });
    expect(result.current.errorMessage).toBeNull();
  });
});
