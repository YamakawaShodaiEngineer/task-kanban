"use client";

import { useId, useState, type FormEvent } from "react";
import { PlusIcon } from "lucide-react";
import TaskTitleField from "@/components/TaskTitleField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTaskDraft } from "@/hooks/useTaskDraft";
import type { NewTask } from "@/types/task";

type TaskFormProps = {
  /** 登録に成功したら true を返す */
  onSubmit: (newTask: NewTask) => Promise<boolean>;
};

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const draft = useTaskDraft();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const descriptionId = useId();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newTask = draft.validate();
    if (!newTask) return;

    setIsSubmitting(true);
    const succeeded = await onSubmit(newTask);
    setIsSubmitting(false);
    if (succeeded) draft.reset();
  };

  return (
    <Card>
      <CardContent>
        <form
          aria-label="タスクの追加"
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] md:items-start"
        >
          <TaskTitleField
            value={draft.title}
            onChange={draft.setTitle}
            error={draft.validationError}
            placeholder="例：資料を作成する"
          />
          <div className="grid gap-2">
            <Label htmlFor={descriptionId}>説明</Label>
            <Textarea
              id={descriptionId}
              value={draft.description}
              onChange={(event) => draft.setDescription(event.target.value)}
              placeholder="任意"
              rows={1}
              className="min-h-8"
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="md:mt-6">
            <PlusIcon data-icon="inline-start" />
            追加
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
