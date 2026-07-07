import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  // If role is not allowed, redirect to a safe default page based on their actual role
  if (!user || !allowedRoles.includes(user.role)) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'mp') return <Navigate to="/mp" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
