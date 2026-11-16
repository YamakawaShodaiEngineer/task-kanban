"use client";

import { useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, fetchTasks, updateTask } from "@/lib/taskRepository";
import type { NewTask, Task, TaskChanges } from "@/types/task";

/**
 * タスク一覧の取得と追加・更新・削除をまとめて管理する。
 * 各操作はSupabaseの応答を待ってから一覧に反映し、成功したら true を返す。
 * 失敗時は一覧を変えずに errorMessage を設定し、false を返す。
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchTasks()
      .then((fetched) => {
        if (!ignore) setTasks(fetched);
      })
      .catch(() => {
        if (!ignore) setErrorMessage("タスクの取得に失敗しました");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  /** 操作を実行し、成功時は一覧を更新してエラーを消す。失敗時はエラーメッセージを設定する */
  const run = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      applyResult: (result: T) => void,
      failureMessage: string,
    ) => {
      let result: T;
      try {
        result = await operation();
      } catch {
        setErrorMessage(failureMessage);
        return false;
      }
      applyResult(result);
      setErrorMessage(null);
      return true;
    },
    [],
  );

  const addTask = useCallback(
    (newTask: NewTask) =>
      run(
        () => createTask(newTask),
        (created) => setTasks((current) => [...current, created]),
        "タスクの追加に失敗しました",
      ),
    [run],
  );

  const editTask = useCallback(
    (id: string, changes: TaskChanges) =>
      run(
        () => updateTask(id, changes),
        (updated) =>
          setTasks((current) => current.map((task) => (task.id === id ? updated : task))),
        "タスクの更新に失敗しました",
      ),
    [run],
  );

  const removeTask = useCallback(
    (id: string) =>
      run(
        () => deleteTask(id),
        () => setTasks((current) => current.filter((task) => task.id !== id)),
        "タスクの削除に失敗しました",
      ),
    [run],
  );

  return { tasks, isLoading, errorMessage, addTask, editTask, removeTask };
}
