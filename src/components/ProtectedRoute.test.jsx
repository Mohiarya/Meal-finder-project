import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Secret Dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("shows a loading state while the session is still being checked, never the protected content", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });
    renderProtected();
    expect(screen.getByText(/authenticating/i)).toBeInTheDocument();
    expect(screen.queryByText("Secret Dashboard")).not.toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    renderProtected();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Secret Dashboard")).not.toBeInTheDocument();
  });

  it("renders the protected content when authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    renderProtected();
    expect(screen.getByText("Secret Dashboard")).toBeInTheDocument();
  });
});
