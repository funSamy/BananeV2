import { Navigate, RouteObject } from "react-router-dom";
import AppLayout from "@/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import NewData from "@/pages/NewData";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPass";
import DataTablePage from "@/pages/DataTable";

export const routes: RouteObject[] = [
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
        element: <Dashboard />,
      },
      {
        path: "new",
        element: <NewData />,
      },
      {
        path: "data",
        element: <DataTablePage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "*",
    element: <Navigate to="/*" replace />,
  },
];

export default routes;
