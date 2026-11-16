import { Skeleton } from "@/components/ui/skeleton";
import { taskStatuses } from "@/types/task";

/** タスク一覧の読み込み中に、フォームと3列の形を表示する */
export default function BoardSkeleton() {
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
