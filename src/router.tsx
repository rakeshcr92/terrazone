import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Team from "./pages/Team";
import Pilot from "./pages/Pilot";
import Book from "./pages/Book";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const routers = [
  /* ---- Public Geozane marketing pages ---- */
  {
    path: "/",
    name: "landing",
    element: <Landing />,
  },
  {
    path: "/team",
    name: "team",
    element: <Team />,
  },
  {
    path: "/pilot",
    name: "pilot",
    element: <Pilot />,
  },
  {
    path: "/book",
    name: "book",
    element: <Book />,
  },

  /* ---- Auth ---- */
  {
    path: "/login",
    name: "login",
    element: <Login />,
  },

  /* ---- Protected TerraZone product ---- */
  {
    path: "/app",
    name: "app",
    element: (
      <ProtectedRoute>
        <Index />
      </ProtectedRoute>
    ),
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
