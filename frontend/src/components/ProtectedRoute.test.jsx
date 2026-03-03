import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("ProtectedRoute", () => {
  it("shows spinner while loading", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: true });
    renderWithRouter(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: "employee" },
      loading: false,
    });
    renderWithRouter(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByText("Secret")).toBeInTheDocument();
  });

  it("redirects when not authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: false });
    renderWithRouter(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });
});
