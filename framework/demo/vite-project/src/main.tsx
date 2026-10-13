import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { UserProvider } from "./contexts/useUser.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./constants/routes.ts";
import { App, About } from "./pages";

const router = createBrowserRouter([
  {
    path: routes.HOME,
    element: <App />,
  },
  {
    path: routes.ABOUT,
    element: <About />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>,
);
