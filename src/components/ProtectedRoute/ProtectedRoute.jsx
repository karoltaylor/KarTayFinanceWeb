import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from '../../pages/Login/Login';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('🛡️ ========== PROTECTED ROUTE CHECK ==========');
    console.log('🛡️ ProtectedRoute state:', {
      loading,
      hasUser: !!user,
      userEmail: user?.email || 'N/A'
    });
    
    if (loading) {
      console.log('⏳ Still loading auth state...');
    } else if (!user) {
      console.log('🚫 No user found - showing Login page');
    } else {
      console.log('✅ User authenticated - rendering protected content');
    }
  }, [user, loading]);

  if (loading) {
    console.log('⏳ Rendering LoadingSpinner');
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('🔐 Rendering Login page');
    return <Login />;
  }

  console.log('✅ Rendering protected content');
  return children;
}
