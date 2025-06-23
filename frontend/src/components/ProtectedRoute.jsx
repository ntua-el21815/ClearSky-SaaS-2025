import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-6 text-center text-gray-500">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  
  return <Outlet />;
}