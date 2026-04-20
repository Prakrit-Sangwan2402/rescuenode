import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to their respective dashboard if they try to access an unauthorized route
    return <Navigate to={role === 'donor' ? '/donor-dashboard' : '/receiver-dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
