import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

/**
 * Guards the public-landing / protected-product routing contract:
 *   /       -> public Geozane landing page
 *   /login  -> TerraZone login
 *   /app    -> protected product (redirects to /login when signed out)
 *   /team, /pilot, /book -> public marketing pages
 *   *       -> NotFound
 */

const getSession = vi.fn();
const onAuthStateChange = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => getSession(),
      onAuthStateChange: (cb: unknown) => onAuthStateChange(cb),
    },
  },
}));

function signedOut() {
  getSession.mockResolvedValue({ data: { session: null } });
  onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="pathname">{location.pathname}</div>;
}

describe("route table", () => {
  beforeEach(() => {
    vi.resetModules();
    signedOut();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("maps every expected path exactly once, with the catch-all last", async () => {
    const { routers } = await import("./router");
    const paths = routers.map((r) => r.path);

    expect(paths).toEqual([
      "/",
      "/team",
      "/pilot",
      "/book",
      "/login",
      "/app",
      "*",
    ]);

    // A duplicate path would silently shadow a route.
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths[paths.length - 1]).toBe("*");
  });

  it("serves the public landing page at / and the product at /app", async () => {
    const { routers } = await import("./router");

    const landing = routers.find((r) => r.path === "/");
    const app = routers.find((r) => r.path === "/app");

    // "/" must NOT be wrapped in ProtectedRoute any more.
    expect(landing?.name).toBe("landing");
    expect(app?.name).toBe("app");
  });
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.resetModules();
    signedOut();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects an unauthenticated visitor from /app to /login", async () => {
    const { ProtectedRoute } = await import("./components/ProtectedRoute");

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <LocationProbe />
        <Routes>
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <div>product</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("pathname").textContent).toBe("/login");
    });

    expect(screen.queryByText("product")).toBeNull();
  });

  it("renders the product for an authenticated visitor", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
    });
    onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const { ProtectedRoute } = await import("./components/ProtectedRoute");

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <LocationProbe />
        <Routes>
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <div>product</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("product")).toBeTruthy();
    });

    expect(screen.getByTestId("pathname").textContent).toBe("/app");
  });
});

describe("Login", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sends an already-authenticated user to /app, not /", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
    });
    onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const { default: Login } = await import("./pages/Login");

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <LocationProbe />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<div>product</div>} />
          <Route path="/" element={<div>landing</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("pathname").textContent).toBe("/app");
    });

    expect(screen.queryByText("landing")).toBeNull();
  });

  it("shows the sign-in form when signed out", async () => {
    signedOut();

    const { default: Login } = await import("./pages/Login");

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("you@company.com")).toBeTruthy();
    });
  });
});

describe("public marketing pages", () => {
  it("render their nav links to /login and the other public routes", async () => {
    const { default: Team } = await import("./pages/Team");

    render(
      <MemoryRouter initialEntries={["/team"]}>
        <Team />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sravya Pogiri")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Pilot Program" }).getAttribute("href"),
    ).toBe("/pilot");
    expect(
      screen.getByRole("link", { name: "Book a Call" }).getAttribute("href"),
    ).toBe("/book");
  });

  it("points the landing nav Login and hero Try Geozane buttons at /login", async () => {
    const { default: Landing } = await import("./pages/Landing");

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Know what the land/)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Login" }).getAttribute("href"),
    ).toBe("/login");
    expect(
      screen.getByRole("link", { name: "Try Geozane" }).getAttribute("href"),
    ).toBe("/login");
    expect(
      screen.getAllByRole("link", { name: "Team" })[0].getAttribute("href"),
    ).toBe("/team");
  });

  it("links the Book page back to the pilot programme", async () => {
    const { default: Book } = await import("./pages/Book");

    render(
      <MemoryRouter initialEntries={["/book"]}>
        <Book />
      </MemoryRouter>,
    );

    expect(
      screen
        .getByRole("link", { name: /View the Pilot Program/ })
        .getAttribute("href"),
    ).toBe("/pilot");
  });
});
