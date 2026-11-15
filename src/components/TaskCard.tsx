"use client";

import { useId, useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
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
  const titleId = useId();
  const descriptionId = useId();
  const statusId = useId();
  const errorId = useId();

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
    <article aria-label={task.title}>
      <Card size="sm" className="transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3">
          {isEditing ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor={titleId}>タイトル</Label>
                <Input
                  id={titleId}
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
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
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  キャンセル
                </Button>
                <Button type="button" size="sm" onClick={save}>
                  保存
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h3 className="font-medium leading-snug break-words">{task.title}</h3>
                {task.description && (
                  <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={statusId} className="sr-only">
                  ステータス
                </Label>
                <NativeSelect
                  id={statusId}
                  size="sm"
                  value={task.status}
                  onChange={(event) => changeStatus(event.target.value)}
                >
                  {taskStatuses.map((status) => (
                    <NativeSelectOption key={status} value={status}>
                      {taskStatusLabels[status]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="編集"
                    title="編集"
                    onClick={startEditing}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="削除"
                    title="削除"
                    onClick={() => onDeleteRequest(task)}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </article>
  );
}
