import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ADMIN_UID = "0S6VJ6EkY4eNJPBtRyz6DwQ5B5F2";

function AdminRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.uid !== ADMIN_UID) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;