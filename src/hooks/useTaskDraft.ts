"use client";

import { useState } from "react";
import { validateTaskTitle } from "@/lib/validateTaskTitle";
import type { NewTask } from "@/types/task";

const emptyDraft: NewTask = { title: "", description: "" };

/**
 * タスクの入力途中の値（タイトル・説明）と検証エラーを管理する。
 * validate() は問題が無ければ前後の空白を除いた値を、あれば null を返す。
 */
export function useTaskDraft(initial: NewTask = emptyDraft) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = (): NewTask | null => {
    const error = validateTaskTitle(title);
    setValidationError(error);
    if (error) return null;
    return { title: title.trim(), description: description.trim() };
  };

  const reset = () => {
    setTitle(emptyDraft.title);
    setDescription(emptyDraft.description);
    setValidationError(null);
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    validationError,
    validate,
    reset,
  };
}
