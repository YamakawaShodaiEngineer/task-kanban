export const maxTaskTitleLength = 100;

/**
 * タスクのタイトルを検証する。問題があればエラーメッセージを、なければ null を返す。
 * 前後の空白は取り除いた上で判定する。
 */
export function validateTaskTitle(title: string): string | null {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return "タイトルを入力してください";
  }
  if (trimmed.length > maxTaskTitleLength) {
    return `タイトルは${maxTaskTitleLength}文字以内で入力してください`;
  }
  return null;
}
