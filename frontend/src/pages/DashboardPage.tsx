import React from 'react';
import ChartAnalysis from '../components/ChartAnalysis';
import { Container } from '@mui/material';

const DashboardPage = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <ChartAnalysis />
    </Container>
  );
};

export default DashboardPage; 