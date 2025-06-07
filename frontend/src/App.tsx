import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPanel from './pages/AdminPanel';
import Header from './components/Header';
import ChartAnalysis from './components/ChartAnalysis';
import BrokeragePage from './pages/BrokeragePage';
import NotificationsPage from './pages/NotificationsPage';
import PermissionProtectedRoute from './components/PermissionProtectedRoute';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Layout para rotas autenticadas que inclui o Header
const MainLayout = () => (
  <>
    <Header />
    <Outlet /> 
  </>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const { isAuthenticated, user } = useAuth();
   if (!isAuthenticated) {
     return <Navigate to="/login" />;
   }
   if (user?.role !== 'admin') {
     return <Navigate to="/dashboard" />;
   }
   return <>{children}</>;
};

function App() {
  const { user, isAuthenticated } = useAuth();
  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" /></ProtectedRoute>} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PermissionProtectedRoute requiredPermission="dashboard">
                  <DashboardPage />
                </PermissionProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route path="/analise" element={<ProtectedRoute><ChartAnalysis /></ProtectedRoute>} />
          
          <Route 
            path="/brokerages" 
            element={
              <ProtectedRoute>
                <PermissionProtectedRoute requiredPermission="brokerages">
                  <BrokeragePage />
                </PermissionProtectedRoute>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <PermissionProtectedRoute requiredPermission="notifications">
                  <NotificationsPage />
                </PermissionProtectedRoute>
              </ProtectedRoute>
            } 
          />

          {user?.role === 'admin' && (
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          )}
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
  );
}

const AppWrapper = () => (
  <AuthProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </AuthProvider>
);

export default AppWrapper;
