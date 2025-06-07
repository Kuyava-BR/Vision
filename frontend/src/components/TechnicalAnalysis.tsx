import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  ShowChart,
  Assessment,
  Analytics,
  Speed,
  Waves,
} from '@mui/icons-material';
import axios from 'axios';

const assets = [
  { value: 'BTC', label: 'Bitcoin (BTC/USD)' },
  { value: 'ETH', label: 'Ethereum (ETH/USD)' },
  { value: 'SOL', label: 'Solana (SOL/USD)' },
  { value: 'AAPL', label: 'Apple (AAPL)' },
  { value: 'GOOGL', label: 'Google (GOOGL)' },
  { value: 'EURUSD', label: 'EUR/USD' },
  { value: 'GBPUSD', label: 'GBP/USD' },
];

const timeframes = [
  { value: '1m', label: '1 minuto' },
  { value: '5m', label: '5 minutos' },
  { value: '15m', label: '15 minutos' },
];

interface AnalysisResult {
  trend: string;
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  support: number;
  resistance: number;
  momentum: number;
  volume: number;
  volatility: number;
  prediction: string;
  confidence: number;
}

const TechnicalAnalysis: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const performAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/analysis`, {
        asset: selectedAsset,
        timeframe: selectedTimeframe,
      });
      setAnalysis(response.data);
    } catch (err) {
      setError('Erro ao realizar análise. Por favor, tente novamente.');
    }
    setLoading(false);
  };

  useEffect(() => {
    performAnalysis();
  }, [selectedAsset, selectedTimeframe]);

  const renderAnalysisCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    description: string
  ) => (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Box display="flex" alignItems="center" mb={1}>
        {icon}
        <Typography variant="h6" ml={1}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" color="primary" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Análise Técnica Avançada
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Selecione o ativo e timeframe para análise detalhada do mercado
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Ativo</InputLabel>
            <Select
              value={selectedAsset}
              label="Ativo"
              onChange={(e) => setSelectedAsset(e.target.value)}
            >
              {assets.map((asset) => (
                <MenuItem key={asset.value} value={asset.value}>
                  {asset.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={selectedTimeframe}
              label="Timeframe"
              onChange={(e) => setSelectedTimeframe(e.target.value)}
            >
              {timeframes.map((tf) => (
                <MenuItem key={tf.value} value={tf.value}>
                  {tf.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        analysis && (
          <>
            <Box mb={4}>
              <Chip
                label={`Tendência: ${analysis.trend}`}
                color={analysis.trend === 'Alta' ? 'success' : analysis.trend === 'Baixa' ? 'error' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip
                label={`Confiança: ${analysis.confidence}%`}
                color={analysis.confidence > 70 ? 'success' : analysis.confidence > 40 ? 'warning' : 'error'}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                {renderAnalysisCard(
                  'RSI',
                  analysis.rsi.toFixed(2),
                  <Speed color="primary" />,
                  'Índice de Força Relativa indica condições de sobrecompra/sobrevenda'
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderAnalysisCard(
                  'MACD',
                  analysis.macd.value.toFixed(2),
                  <TrendingUp color="primary" />,
                  'Convergência/Divergência de Médias Móveis'
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderAnalysisCard(
                  'Momentum',
                  analysis.momentum.toFixed(2),
                  <Waves color="primary" />,
                  'Força do movimento atual do preço'
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderAnalysisCard(
                  'Suporte',
                  analysis.support.toFixed(2),
                  <ShowChart color="primary" />,
                  'Nível de suporte mais próximo'
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderAnalysisCard(
                  'Resistência',
                  analysis.resistance.toFixed(2),
                  <Timeline color="primary" />,
                  'Nível de resistência mais próximo'
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderAnalysisCard(
                  'Volume',
                  analysis.volume.toFixed(2),
                  <Assessment color="primary" />,
                  'Volume de negociação atual'
                )}
              </Grid>
            </Grid>

            <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Análise Preditiva
              </Typography>
              <Typography variant="body1" paragraph>
                {analysis.prediction}
              </Typography>
              <Box display="flex" alignItems="center">
                <Analytics color="primary" />
                <Typography variant="body2" color="text.secondary" ml={1}>
                  Baseado em análise de múltiplos indicadores técnicos e padrões gráficos
                </Typography>
              </Box>
            </Paper>
          </>
        )
      )}
    </Container>
  );
};

export default TechnicalAnalysis; 