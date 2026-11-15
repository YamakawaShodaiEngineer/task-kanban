"use client";

import { useId, useState, type FormEvent } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();

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
    <Card>
      <CardContent>
        <form
          aria-label="タスクの追加"
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] md:items-start"
        >
          <div className="grid gap-2">
            <Label htmlFor={titleId}>タイトル</Label>
            <Input
              id={titleId}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例：資料を作成する"
              aria-invalid={validationError ? true : undefined}
              aria-describedby={validationError ? errorId : undefined}
            />
            {validationError && (
              <p id={errorId} role="alert" className="text-sm text-destructive">
                {validationError}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor={descriptionId}>説明</Label>
            <Textarea
              id={descriptionId}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
