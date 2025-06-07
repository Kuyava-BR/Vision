import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Chart {
  id: number;
  title: string;
  description?: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  isFavorite?: boolean;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string[];
      tension?: number;
    }[];
  };
}

const chartColors = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
];

const Dashboard: React.FC = () => {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chartType, setChartType] = useState<Chart['type']>('line');
  const [data, setData] = useState<Chart['data'] | null>(null);

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<Chart[]>('http://localhost:5000/api/charts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCharts(response.data);
    } catch (error) {
      console.error('Erro ao buscar gráficos:', error);
    }
  };

  const handleCreateChart = async () => {
    try {
      const token = localStorage.getItem('token');
      const defaultData = {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
        datasets: [
          {
            label: 'Dados',
            data: [12, 19, 3, 5, 2, 3],
            borderColor: chartColors[0],
            backgroundColor: chartType === 'line' ? chartColors[0] : chartColors,
            tension: 0.1,
          },
        ],
      };

      await axios.post(
        'http://localhost:5000/api/charts',
        {
          title,
          description,
          type: chartType,
          data: data || defaultData,
          isFavorite: false,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOpen(false);
      fetchCharts();
      resetForm();
    } catch (error) {
      console.error('Erro ao criar gráfico:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setChartType('line');
    setData(null);
  };

  const toggleFavorite = async (chartId: number) => {
    try {
      const token = localStorage.getItem('token');
      const chart = charts.find((c) => c.id === chartId);
      if (chart) {
        await axios.put(
          `http://localhost:5000/api/charts/${chartId}`,
          {
            ...chart,
            isFavorite: !chart.isFavorite,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchCharts();
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };

  const downloadChart = (chartId: number) => {
    const chart = charts.find((c) => c.id === chartId);
    if (!chart) return;

    const canvas = document.querySelector(`#chart-${chartId}`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${chart.title}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const renderChart = (chart: Chart) => {
    const props = {
      data: chart.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
        },
      },
      id: `chart-${chart.id}`,
    };

    switch (chart.type) {
      case 'bar':
        return <Bar {...props} />;
      case 'pie':
        return <Pie {...props} />;
      case 'doughnut':
        return <Doughnut {...props} />;
      default:
        return <Line {...props} />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Novo Gráfico
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          {charts.map((chart) => (
            <Grid key={chart.id} item xs={12} md={6} lg={4}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 300,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">{chart.title}</Typography>
                  <Box>
                    <IconButton onClick={() => toggleFavorite(chart.id)}>
                      {chart.isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <IconButton onClick={() => downloadChart(chart.id)}>
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, position: 'relative' }}>
                  {renderChart(chart)}
                </Box>
                {chart.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {chart.description}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Gráfico</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo de Gráfico</InputLabel>
            <Select
              value={chartType}
              label="Tipo de Gráfico"
              onChange={(e) => setChartType(e.target.value as Chart['type'])}
            >
              <MenuItem value="line">Linha</MenuItem>
              <MenuItem value="bar">Barras</MenuItem>
              <MenuItem value="pie">Pizza</MenuItem>
              <MenuItem value="doughnut">Rosca</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            resetForm();
          }}>
            Cancelar
          </Button>
          <Button onClick={handleCreateChart}>Criar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 