import * as React from 'react';
import { Link } from 'react-router-dom';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../contexts/AuthContext';

export const MainListItems = () => {
  const { user } = useAuth();

  return (
    <React.Fragment>
      <ListItemButton component={Link} to="/dashboard">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
      <ListItemButton component={Link} to="/analise">
        <ListItemIcon>
          <ShowChartIcon />
        </ListItemIcon>
        <ListItemText primary="Análise IA" />
      </ListItemButton>
      <ListItemButton component={Link} to="/notifications">
        <ListItemIcon>
          <NotificationsIcon />
        </ListItemIcon>
        <ListItemText primary="Notificações" />
      </ListItemButton>
      <ListItemButton component={Link} to="/brokerages">
        <ListItemIcon>
          <AccountBalanceWalletIcon />
        </ListItemIcon>
        <ListItemText primary="Corretoras" />
      </ListItemButton>
      {user?.role === 'admin' && (
        <ListItemButton component={Link} to="/admin">
          <ListItemIcon>
            <AdminPanelSettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Painel Admin" />
        </ListItemButton>
      )}
    </React.Fragment>
  );
}; 