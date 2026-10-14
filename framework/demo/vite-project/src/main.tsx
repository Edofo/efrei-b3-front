import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { UserProvider } from "./contexts/useUser.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./constants/routes.ts";
import { App, Dashboard, Details } from "./pages";
import { Home, Stats } from "./pages/dashboard/index.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createBrowserRouter([
  {
    path: routes.HOME,
    element: <App />,
  },
  {
    path: routes.DETAILS,
    Component: Details,
  },
  {
    path: routes.DASHBOARD,
    Component: Dashboard,
    children: [
      {
        path: routes.DASHBOARD_HOME,
        Component: Home,
      },
      {
        path: routes.DASHBOARD_STATS,
        Component: Stats,
      },
    ],
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </QueryClientProvider>
  </StrictMode>,
);
