import React from 'react';
import Register from '../components/Register';
import { Container, Paper, Box } from '@mui/material';

const RegisterPage = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Register />
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 