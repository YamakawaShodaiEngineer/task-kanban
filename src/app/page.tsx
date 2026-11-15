import { KanbanSquareIcon } from "lucide-react";
import TaskBoard from "@/components/TaskBoard";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <KanbanSquareIcon className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <h1 className="text-lg leading-tight font-semibold tracking-tight">タスクカンバン</h1>
            <p className="text-xs text-muted-foreground">タスクを追加して、進み具合ごとに整理しましょう</p>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
        <TaskBoard />
      </main>
    </div>
  );
}
