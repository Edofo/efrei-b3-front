import { useUser } from "@/contexts/useUser";
import { Navigate } from "react-router";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
