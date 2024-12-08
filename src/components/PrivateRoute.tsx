import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show a loading indicator while checking the auth state
  if (loading) {
    return <div className="loading-spinner">Loading...</div>; // Replace with your loading spinner
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
