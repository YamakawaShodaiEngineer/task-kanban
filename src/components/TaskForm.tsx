"use client";

import { useState, type FormEvent } from "react";
import { validateTaskTitle } from "@/lib/validateTaskTitle";
import type { NewTask } from "@/types/task";

type TaskFormProps = {
  /** 登録に成功したら true を返す */
  onSubmit: (newTask: NewTask) => Promise<boolean>;
};

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateTaskTitle(title);
    setValidationError(error);
    if (error) return;

    setIsSubmitting(true);
    const succeeded = await onSubmit({
      title: title.trim(),
      description: description.trim(),
    });
    setIsSubmitting(false);
    if (succeeded) {
      setTitle("");
      setDescription("");
    }
  };

  return (
    <form
      aria-label="タスクの追加"
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
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
      <button
        type="submit"
        disabled={isSubmitting}
        className="self-end rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        追加
      </button>
    </form>
  );
}
