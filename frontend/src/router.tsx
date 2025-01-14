import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/protected-route";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ForgotPassword from "@/pages/ForgotPass";
import NewData from "@/pages/NewData";
import DataTablePage from "@/pages/DataTable";
import AppLayout from "@/layout/AppLayout";
import NotFound from "@/pages/NotFound";

// Public routes (no auth required)
const publicRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

// Protected routes (auth required)
const protectedRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "new",
        element: (
          <ProtectedRoute>
            <NewData />
          </ProtectedRoute>
        ),
      },
      {
        path: "data",
        element: (
          <ProtectedRoute>
            <DataTablePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

export default createBrowserRouter([...publicRoutes, ...protectedRoutes]);
