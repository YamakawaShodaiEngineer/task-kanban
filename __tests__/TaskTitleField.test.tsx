import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskTitleField from "@/components/TaskTitleField";

const onChange = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
});

describe("TaskTitleField", () => {
  it("「タイトル」というラベルで入力欄を取得でき、値とプレースホルダーが表示される", () => {
    render(
      <TaskTitleField value="買い物" onChange={onChange} error={null} placeholder="例：資料を作成する" />,
    );

    const input = screen.getByLabelText("タイトル") as HTMLInputElement;
    expect(input.value).toBe("買い物");
    expect(input.placeholder).toBe("例：資料を作成する");
  });

  it("入力すると、入力した文字が onChange に渡される", async () => {
    const user = userEvent.setup();
    render(<TaskTitleField value="" onChange={onChange} error={null} />);

    await user.type(screen.getByLabelText("タイトル"), "あ");

    expect(onChange).toHaveBeenCalledWith("あ");
  });

  it("エラーが無いとき、エラー表示も入力欄の aria-invalid も無い", () => {
    render(<TaskTitleField value="" onChange={onChange} error={null} />);

    const input = screen.getByLabelText("タイトル");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("エラーがあるとき、エラー文言が表示され入力欄がそのエラーで説明される", () => {
    render(<TaskTitleField value="" onChange={onChange} error="タイトルを入力してください" />);

    const input = screen.getByLabelText("タイトル");
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("タイトルを入力してください");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(alert.id);
  });
});
