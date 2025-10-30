import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext, IAuthContext } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { token } = useContext(AuthContext) as IAuthContext;

  if (!token) {
    // If no token, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If there is a token, render the child routes (e.action, Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;