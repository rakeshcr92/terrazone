import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("combines class names", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

 it("handles conditional class names", () => {
  const shouldHide = false;
  expect(cn("base", shouldHide ? "hidden" : undefined, "active")).toBe("base active");
});

  it("resolves Tailwind class conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});