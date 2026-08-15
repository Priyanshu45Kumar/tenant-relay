import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import { getStoredAuth } from "../../lib/auth.storage";
import { getCurrentUser } from "../../api/auth.api";

const ProtectedRoute = () => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuthentication = async () => {
      const storedAuth = getStoredAuth();

      if (!storedAuth?.accessToken) {
        setAuthenticated(false);
        setChecking(false);
        return;
      }

      try {
        await getCurrentUser();

        setAuthenticated(true);
      } catch (error) {
        console.error("Authentication verification failed:", error);

        localStorage.removeItem("tenantrelay_auth");
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    verifyAuthentication();
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Checking authentication...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;