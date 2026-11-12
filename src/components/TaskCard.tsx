"use client";

import { useState } from "react";
import { validateTaskTitle } from "@/lib/validateTaskTitle";
import {
  isTaskStatus,
  taskStatuses,
  taskStatusLabels,
  type Task,
  type TaskChanges,
} from "@/types/task";

type TaskCardProps = {
  task: Task;
  /** 更新に成功したら true を返す */
  onUpdate: (id: string, changes: TaskChanges) => Promise<boolean>;
  onDeleteRequest: (task: Task) => void;
};

export default function TaskCard({ task, onUpdate, onDeleteRequest }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [validationError, setValidationError] = useState<string | null>(null);

  const startEditing = () => {
    setTitle(task.title);
    setDescription(task.description);
    setValidationError(null);
    setIsEditing(true);
  };

  const save = async () => {
    const error = validateTaskTitle(title);
    setValidationError(error);
    if (error) return;

    const succeeded = await onUpdate(task.id, {
      title: title.trim(),
      description: description.trim(),
    });
    if (succeeded) setIsEditing(false);
  };

  const changeStatus = (value: string) => {
    if (isTaskStatus(value) && value !== task.status) {
      void onUpdate(task.id, { status: value });
    }
  };

  return (
    <article
      aria-label={task.title}
      className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      {isEditing ? (
        <>
          <label className="flex flex-col gap-1 text-sm">
            タイトル
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            説明
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
            />
          </label>
          {validationError && (
            <p role="alert" className="text-sm text-red-600">
              {validationError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-600"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-medium break-words">{task.title}</h3>
          {task.description && (
            <p className="text-sm whitespace-pre-wrap break-words text-zinc-600 dark:text-zinc-400">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-1 text-xs">
              ステータス
              <select
                value={task.status}
                onChange={(event) => changeStatus(event.target.value)}
                className="rounded border border-zinc-300 px-1 py-0.5 dark:border-zinc-600 dark:bg-zinc-800"
              >
                {taskStatuses.map((status) => (
                  <option key={status} value={status}>
                    {taskStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={startEditing}
                className="rounded border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-600"
              >
                編集
              </button>
              <button
                type="button"
                onClick={() => onDeleteRequest(task)}
                className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600"
              >
                削除
              </button>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
