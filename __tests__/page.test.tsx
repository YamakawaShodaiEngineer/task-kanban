import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

// Supabase（外部依存）へのアクセス層のみモックする
vi.mock("@/lib/taskRepository", () => ({
  fetchTasks: vi.fn().mockResolvedValue([]),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

test("ホームページに見出しが表示される", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: "タスクカンバン" }),
  ).toBeDefined();
});
