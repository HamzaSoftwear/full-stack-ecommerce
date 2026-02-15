import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getToken } from "../api";

export default function AdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  const storedToken = getToken();
  const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const storedIsAdmin =
    typeof window !== "undefined" ? localStorage.getItem("isAdmin") === "true" : false;

  const activeUser =
    user ||
    (storedToken && storedUserId ? { id: storedUserId, isAdmin: storedIsAdmin } : null);

  if (!activeUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!activeUser.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
