import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [openPermDialog, setOpenPermDialog] = useState(false);
  const [permUser, setPermUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleRoleChange = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/users/${selectedUser?.id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/create', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenCreateDialog(false);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      alert('Erro ao criar usuário!');
    }
  };

  const handleActiveToggle = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/users/${user.id}/active`, { isActive: !user.isActive }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      alert('Erro ao alterar status!');
    }
  };

  const handleOpenPermDialog = (user: User) => {
    setPermUser(user);
    setPermissions(user.permissions || []);
    setOpenPermDialog(true);
  };

  const handleSavePermissions = async () => {
    if (!permUser) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/users/${permUser.id}/permissions`, { permissions }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenPermDialog(false);
      fetchUsers();
    } catch (error) {
      alert('Erro ao salvar permissões!');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Painel Administrativo
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Usuários" />
          <Tab label="Estatísticas" />
          <Tab label="Configurações" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenCreateDialog(true)}>
          Criar Novo Usuário
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Papel</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Permissões</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button size="small" color={user.isActive ? 'success' : 'warning'} onClick={() => handleActiveToggle(user)}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleOpenPermDialog(user)}>
                      Editar Permissões
                    </Button>
                    <div style={{ fontSize: 12 }}>{(user.permissions || []).join(', ')}</div>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => { setSelectedUser(user); setNewRole(user.role); setOpenDialog(true); }}>Editar Papel</Button>
                    {user.role !== 'admin' && (
                      <Button size="small" color="error" onClick={() => handleDeleteUser(user.id)}>Deletar</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6">Estatísticas do Sistema</Typography>
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography>Total de Usuários: {users.length}</Typography>
          <Typography>
            Usuários Premium:{' '}
            {users.filter((user) => user.role === 'premium').length}
          </Typography>
          <Typography>
            Administradores: {users.filter((user) => user.role === 'admin').length}
          </Typography>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6">Configurações do Sistema</Typography>
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography>Em desenvolvimento...</Typography>
        </Paper>
      </TabPanel>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Alterar Papel do Usuário</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Papel</InputLabel>
            <Select
              value={newRole}
              label="Papel"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="user">Usuário</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleRoleChange}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Criar Novo Usuário</DialogTitle>
        <DialogContent>
          <TextField label="Nome" fullWidth margin="dense" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
          <TextField label="Email" fullWidth margin="dense" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
          <TextField label="Senha" type="password" fullWidth margin="dense" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Papel</InputLabel>
            <Select value={newUser.role} label="Papel" onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
              <MenuItem value="user">Usuário</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateUser}>Criar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPermDialog} onClose={() => setOpenPermDialog(false)}>
        <DialogTitle>Permissões Extras</DialogTitle>
        <DialogContent>
          <TextField
            label="Permissões (separadas por vírgula)"
            fullWidth
            margin="dense"
            value={permissions.join(', ')}
            onChange={e => setPermissions(e.target.value.split(',').map(p => p.trim()))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPermDialog(false)}>Cancelar</Button>
          <Button onClick={handleSavePermissions}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 