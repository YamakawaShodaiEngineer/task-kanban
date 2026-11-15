import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// globals を有効にしていないため、テストごとに描画した DOM を手動で片付ける
afterEach(() => {
  cleanup();
});
