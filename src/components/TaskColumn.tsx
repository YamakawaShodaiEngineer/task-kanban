"use client";

import { useId } from "react";
import TaskCard from "@/components/TaskCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { taskStatusLabels, type Task, type TaskChanges, type TaskStatus } from "@/types/task";

/** 列見出しの横に表示するステータス色（globals.cssのテーマ変数） */
const statusDotClasses: Record<TaskStatus, string> = {
  todo: "bg-status-todo",
  in_progress: "bg-status-in-progress",
  done: "bg-status-done",
};

type TaskColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  /** 更新に成功したら true を返す */
  onUpdate: (id: string, changes: TaskChanges) => Promise<boolean>;
  onDeleteRequest: (task: Task) => void;
};

/** 1つのステータスの列（見出し・件数・タスクカード） */
export default function TaskColumn({ status, tasks, onUpdate, onDeleteRequest }: TaskColumnProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/5"
    >
      <div className="flex items-center gap-2 px-1">
        <span aria-hidden="true" className={cn("size-2 rounded-full", statusDotClasses[status])} />
        <h2 id={headingId} className="text-sm font-semibold">
          {taskStatusLabels[status]}
        </h2>
        <Badge variant="secondary" className="ml-auto tabular-nums">
          {tasks.length}件
        </Badge>
      </div>
      {tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
          タスクはありません
        </p>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdate}
            onDeleteRequest={onDeleteRequest}
          />
        ))
      )}
    </section>
  );
}
