import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOtp from "../pages/auth/VerifyOtp";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Webhooks from "../pages/Webhooks/Webhooks";
import Events from "../pages/events/Events";
function HomePage() {
  return <div>TenantRelay Home</div>;
}


export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path:"/verify-otp",
        element:<VerifyOtp/>
      }
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path:"/webhooks",
            element:<Webhooks/>
          },
          {
            path:"/events",
            element:<Events/>
          }
        ],
      },
    ],
  },
]);