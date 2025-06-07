import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Alert, Container } from '@mui/material';

interface PermissionProtectedRouteProps {
  requiredPermission: string;
  children: React.ReactNode;
}

const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({ requiredPermission, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Admin always has access
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  const hasPermission = user?.permissions?.includes(requiredPermission);

  if (!hasPermission) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Acesso Negado
        </Typography>
        <Alert severity="error">
          Você não tem permissão para acessar esta página. Por favor, contate um administrador para solicitar o acesso.
        </Alert>
      </Container>
    );
  }

  return <>{children}</>;
};

export default PermissionProtectedRoute; 