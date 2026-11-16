"use client";

import { useState } from "react";
import { CircleAlertIcon } from "lucide-react";
import BoardSkeleton from "@/components/BoardSkeleton";
import ConfirmDialog from "@/components/ConfirmDialog";
import TaskColumn from "@/components/TaskColumn";
import TaskForm from "@/components/TaskForm";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useTasks } from "@/hooks/useTasks";
import { taskStatuses, type Task } from "@/types/task";

export default function TaskBoard() {
  const { tasks, isLoading, errorMessage, addTask, editTask, removeTask } = useTasks();
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    const { id } = deletingTask;
    setDeletingTask(null);
    await removeTask(id);
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
          <TaskForm onSubmit={addTask} />
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
            {taskStatuses.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasks.filter((task) => task.status === status)}
                onUpdate={editTask}
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
