"use client";

import { useEffect, useId, useState } from "react";
import { CircleAlertIcon } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createTask, deleteTask, fetchTasks, updateTask } from "@/lib/taskRepository";
import {
  taskStatuses,
  taskStatusLabels,
  type NewTask,
  type Task,
  type TaskChanges,
  type TaskStatus,
} from "@/types/task";

/** 列見出しの横に表示するステータス色（globals.cssのテーマ変数） */
const statusDotClasses: Record<TaskStatus, string> = {
  todo: "bg-status-todo",
  in_progress: "bg-status-in-progress",
  done: "bg-status-done",
};

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

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

  const handleCreate = async (newTask: NewTask) => {
    try {
      const created = await createTask(newTask);
      setTasks((current) => [...current, created]);
      setErrorMessage(null);
      return true;
    } catch {
      setErrorMessage("タスクの追加に失敗しました");
      return false;
    }
  };

  const handleUpdate = async (id: string, changes: TaskChanges) => {
    try {
      const updated = await updateTask(id, changes);
      setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
      setErrorMessage(null);
      return true;
    } catch {
      setErrorMessage("タスクの更新に失敗しました");
      return false;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    const { id } = deletingTask;
    setDeletingTask(null);
    try {
      await deleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
      setErrorMessage(null);
    } catch {
      setErrorMessage("タスクの削除に失敗しました");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {errorMessage && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>{errorMessage}</AlertTitle>
        </Alert>
      )}
      {isLoading ? (
        <BoardSkeleton />
      ) : (
        <>
          <TaskForm onSubmit={handleCreate} />
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
            {taskStatuses.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasks.filter((task) => task.status === status)}
                onUpdate={handleUpdate}
                onDeleteRequest={setDeletingTask}
              />
            ))}
          </div>
        </>
      )}
      {deletingTask && (
        <ConfirmDialog
          title="タスクの削除"
          message={`「${deletingTask.title}」を削除しますか？`}
          confirmLabel="削除する"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">読み込み中...</span>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {taskStatuses.map((status) => (
          <div key={status} className="flex flex-col gap-3 rounded-xl bg-muted/50 p-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

type TaskColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  onUpdate: (id: string, changes: TaskChanges) => Promise<boolean>;
  onDeleteRequest: (task: Task) => void;
};

function TaskColumn({ status, tasks, onUpdate, onDeleteRequest }: TaskColumnProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/5"
    >
      <div className="flex items-center gap-2 px-1">
        <span aria-hidden="true" className={`size-2 rounded-full ${statusDotClasses[status]}`} />
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
