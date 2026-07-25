import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Restreint l'accès aux utilisateurs connectés :
// redirige vers /login si aucun jeton n'est présent.
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
