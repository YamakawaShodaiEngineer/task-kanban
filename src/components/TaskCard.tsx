"use client";

import { useId, useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import TaskEditForm from "@/components/TaskEditForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  isTaskStatus,
  taskStatuses,
  taskStatusLabels,
  type NewTask,
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
  const statusId = useId();

  const save = async (changes: NewTask) => {
    const succeeded = await onUpdate(task.id, changes);
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
            <TaskEditForm task={task} onSave={save} onCancel={() => setIsEditing(false)} />
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
                    onClick={() => setIsEditing(true)}
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
