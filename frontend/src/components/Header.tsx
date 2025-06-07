import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to={isAuthenticated ? "/dashboard" : "/login"} style={{ textDecoration: 'none', color: 'inherit' }}>
            Vision Analytics
          </Link>
        </Typography>
        <Box>
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Button color="inherit" component={Link} to="/admin">
                  Painel de Admin
                </Button>
              )}
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/notifications">
                Alertas
              </Button>
              <Button color="inherit" component={Link} to="/brokerages">
                Corretoras
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Registrar
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 