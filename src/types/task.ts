export const taskStatuses = ["todo", "in_progress", "done"] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
};

export type NewTask = Pick<Task, "title" | "description">;

export type TaskChanges = Partial<Pick<Task, "title" | "description" | "status">>;

export const isTaskStatus = (value: string): value is TaskStatus =>
  (taskStatuses as readonly string[]).includes(value);
