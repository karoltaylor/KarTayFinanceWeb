import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from '../../pages/Login/Login';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login />;
  }

  return children;
}
