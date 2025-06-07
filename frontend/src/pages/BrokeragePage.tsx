import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress, Alert as MuiAlert } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import API_URL from '../config/api';

const BrokeragePage = () => {
  const [connections, setConnections] = useState([]);
  const [open, setOpen] = useState(false);
  const [newConnection, setNewConnection] = useState({ brokerage: 'Binance', apiKey: '', apiSecret: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  const fetchConnections = async () => {
    const response = await fetch(`${API_URL}/api/brokerages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setConnections(data);
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const response = await fetch(`${API_URL}/api/brokerages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newConnection)
    });
    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      setSuccess(data.message || 'Conexão adicionada com sucesso!');
      setOpen(false);
      fetchConnections();
    } else {
      setError(data.message || 'Ocorreu um erro.');
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/api/brokerages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchConnections();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewConnection({ ...newConnection, [e.target.name]: e.target.value });
  };

  const openDialog = () => {
    setError('');
    setSuccess('');
    setNewConnection({ brokerage: 'Binance', apiKey: '', apiSecret: '' });
    setOpen(true);
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Conexões com Corretoras</Typography>
      {success && <MuiAlert severity="success" sx={{ mb: 2 }}>{success}</MuiAlert>}
      <Button startIcon={<AddIcon />} variant="contained" onClick={openDialog}>Adicionar Conexão</Button>
      <Paper sx={{ mt: 2 }}>
        <List>
          {connections.map((conn: any) => (
            <ListItem key={conn.id}>
              <ListItemText 
                primary={conn.brokerage} 
                secondary={`Conectado em: ${new Date(conn.createdAt).toLocaleDateString()}`} 
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(conn.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Adicionar Conexão com Binance</DialogTitle>
        <DialogContent sx={{pt: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
            {error && <MuiAlert severity="error">{error}</MuiAlert>}
            <TextField label="API Key" name="apiKey" value={newConnection.apiKey} onChange={handleInputChange} />
            <TextField label="API Secret" name="apiSecret" type="password" value={newConnection.apiSecret} onChange={handleInputChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Salvar e Testar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrokeragePage; 