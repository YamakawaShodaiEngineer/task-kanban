"use client";

import { useId } from "react";
import TaskTitleField from "@/components/TaskTitleField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTaskDraft } from "@/hooks/useTaskDraft";
import type { NewTask, Task } from "@/types/task";

type TaskEditFormProps = {
  task: Task;
  /** 検証を通った値（前後の空白は除去済み）で呼ばれる */
  onSave: (changes: NewTask) => void | Promise<void>;
  onCancel: () => void;
};

/** タスクカード内でタイトルと説明を編集するフォーム */
export default function TaskEditForm({ task, onSave, onCancel }: TaskEditFormProps) {
  const draft = useTaskDraft({ title: task.title, description: task.description });
  const descriptionId = useId();

  const save = async () => {
    const changes = draft.validate();
    if (changes) await onSave(changes);
  };

  return (
    <>
      <TaskTitleField
        value={draft.title}
        onChange={draft.setTitle}
        error={draft.validationError}
      />
      <div className="grid gap-2">
        <Label htmlFor={descriptionId}>説明</Label>
        <Textarea
          id={descriptionId}
          value={draft.description}
          onChange={(event) => draft.setDescription(event.target.value)}
          rows={2}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="button" size="sm" onClick={save}>
          保存
        </Button>
      </div>
    </>
  );
}
