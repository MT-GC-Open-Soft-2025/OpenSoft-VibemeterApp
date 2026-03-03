import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

function ThrowingChild() {
  throw new Error("Test error");
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders fallback when child throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Refresh Page")).toBeInTheDocument();
    spy.mockRestore();
  });
});
