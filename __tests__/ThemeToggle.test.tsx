import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";

const renderToggle = (defaultTheme: "light" | "dark") => {
  const user = userEvent.setup();
  render(
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem={false}>
      <ThemeToggle />
    </ThemeProvider>,
  );
  return user;
};

const toggleButton = () => screen.getByRole("button", { name: "テーマの切り替え" });
const isDark = () => document.documentElement.classList.contains("dark");

beforeEach(() => {
  // jsdomにはmatchMediaが無いため、OS設定が「ライト」のブラウザとして最小限の代替を用意する
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
});

describe("テーマの切り替え", () => {
  it("ライトテーマでボタンを押すと、ダークテーマになる", async () => {
    const user = renderToggle("light");
    expect(isDark()).toBe(false);

    await user.click(toggleButton());

    expect(isDark()).toBe(true);
  });

  it("ダークテーマでボタンを押すと、ライトテーマに戻る", async () => {
    const user = renderToggle("dark");
    expect(isDark()).toBe(true);

    await user.click(toggleButton());

    expect(isDark()).toBe(false);
  });

  it("ボタンを2回押すと、元のテーマに戻る", async () => {
    const user = renderToggle("light");

    await user.click(toggleButton());
    await user.click(toggleButton());

    expect(isDark()).toBe(false);
  });
});
