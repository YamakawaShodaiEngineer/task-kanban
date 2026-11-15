import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";
import { isTaskStatus, type NewTask, type Task, type TaskChanges } from "@/types/task";

const columns = "id, title, description, status";

type TaskRow = Pick<Tables<"tasks">, "id" | "title" | "description" | "status">;

function toTask(row: TaskRow): Task {
  if (!isTaskStatus(row.status)) {
    throw new Error(`不正なステータスです: ${row.status}`);
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(columns)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(toTask);
}

export async function createTask(newTask: NewTask): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert(newTask)
    .select(columns)
    .single();
  if (error) throw new Error(error.message);
  return toTask(data);
}

export async function updateTask(id: string, changes: TaskChanges): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update(changes)
    .eq("id", id)
    .select(columns)
    .single();
  if (error) throw new Error(error.message);
  return toTask(data);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
