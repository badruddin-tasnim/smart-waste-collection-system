import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Redirects to /login if the user is not signed in.
 * If role is "admin", also redirects non-admin users to /resident/schedule.
 */
export function RequireAuth({ children, role }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role === "admin" && profile?.role !== "admin") {
    return <Navigate to="/resident/schedule" replace />;
  }

  if (role === "resident" && profile?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
