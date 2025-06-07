import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import API_URL from '../config/api';

// Interface para representar a estrutura de uma notificação
interface Notification {
  id: number;
  asset: string;
  signal: 'buy' | 'sell';
  priceAtSignal: number;
  indicator: string;
  reason: string;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar notificações do servidor.');
        }

        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro desconhecido.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  const renderContent = () => {
    if (loading) {
      return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
    }
    if (error) {
      return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }
    if (notifications.length === 0) {
      return (
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          Nenhuma oportunidade identificada no momento. O sistema está analisando o mercado.
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ativo</TableCell>
              <TableCell>Sinal</TableCell>
              <TableCell>Preço no Sinal</TableCell>
              <TableCell>Indicador</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell>{notification.asset}</TableCell>
                <TableCell>
                  <Chip
                    label={notification.signal === 'buy' ? 'Compra' : 'Venda'}
                    color={notification.signal === 'buy' ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>${Number(notification.priceAtSignal).toFixed(2)}</TableCell>
                <TableCell>{notification.indicator}</TableCell>
                <TableCell>{notification.reason}</TableCell>
                <TableCell>{new Date(notification.createdAt).toLocaleString('pt-BR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Oportunidades de Mercado
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Sinais gerados automaticamente com base em análises técnicas do mercado.
      </Typography>
      {renderContent()}
    </Box>
  );
};

export default NotificationsPage; 