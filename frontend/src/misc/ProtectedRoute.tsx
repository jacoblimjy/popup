import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth(); // Replace with your actual auth logic

  if (isAuthLoading) {
    return <div><Loader loading={isAuthLoading}/></div>;
  }

  if (!isAuthenticated) {
    // Redirect to login if the user is not authenticated
    console.log('User is not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;