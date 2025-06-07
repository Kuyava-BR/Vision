import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Checkbox, FormControlLabel, FormGroup, Grid, Button, Snackbar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import API_URL from '../config/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'premium' | 'admin';
  permissions: string[];
}

const availablePermissions = [
  { key: 'dashboard', label: 'Painel' },
  { key: 'notifications', label: 'Alertas' },
  { key: 'brokerages', label: 'Corretoras' },
];

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const { user: adminUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Falha ao buscar usuários do sistema.');
      
      const data: User[] = await response.json();
      setUsers(data.filter(u => u.id !== adminUser?.id));
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  }, [adminUser?.id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePermissionChange = (userId: number, permissionKey: string, isChecked: boolean) => {
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === userId) {
          const newPermissions = isChecked
            ? [...user.permissions, permissionKey]
            : user.permissions.filter(p => p !== permissionKey);
          return { ...user, permissions: newPermissions };
        }
        return user;
      })
    );
  };

  const handleSaveChanges = async (userId: number) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions: userToUpdate.permissions }),
      });
      setSnackbar({ open: true, message: `Permissões para ${userToUpdate.name} salvas com sucesso!`, severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Falha ao salvar permissões.', severity: 'error' });
    }
  };

  const renderContent = () => {
    if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
    if (error) return <Alert severity="error">{error}</Alert>;
    return (
      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} md={6} lg={4} key={user.id}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user.email}</Typography>
              <FormGroup>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Permissões de Acesso:</Typography>
                {availablePermissions.map(permission => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={user.permissions?.includes(permission.key) ?? false}
                        onChange={(e) => handlePermissionChange(user.id, permission.key, e.target.checked)}
                      />
                    }
                    label={permission.label}
                    key={permission.key}
                  />
                ))}
              </FormGroup>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => handleSaveChanges(user.id)}
              >
                Salvar Alterações
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Permissões
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Atribua permissões de acesso às páginas para cada usuário do sistema.
      </Typography>
      {renderContent()}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel; 