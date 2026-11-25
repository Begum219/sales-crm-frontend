import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Giriş yapmamış kullanıcıyı login'e gönderir
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Giriş yapmış kullanıcıyı login/register yerine dashboard'a gönderir
export function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}