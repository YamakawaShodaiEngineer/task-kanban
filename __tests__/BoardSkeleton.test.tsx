import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import BoardSkeleton from "@/components/BoardSkeleton";

it("読み込み中であることがステータスとして読み上げられる", () => {
  render(<BoardSkeleton />);

  expect(screen.getByRole("status").textContent).toContain("読み込み中...");
});

it("読み込み中は列やフォームが表示されない", () => {
  render(<BoardSkeleton />);

  expect(screen.queryByRole("region")).toBeNull();
  expect(screen.queryByRole("form")).toBeNull();
});
