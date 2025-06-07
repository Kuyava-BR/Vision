import React, { useState } from 'react';
import { Container, Typography, Button, Box, Select, MenuItem, InputLabel, FormControl, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

const timeframes = ['1min', '5min', '15min', '1h', '4h', '1d'];
const ativos = ['BTC', 'ETH', 'Ações', 'Forex', 'Outro'];

const IaAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [timeframe, setTimeframe] = useState('1min');
  const [ativo, setAtivo] = useState('BTC');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('timeframe', timeframe);
    formData.append('ativo', ativo);
    try {
      const response = await axios.post('http://localhost:5000/api/ia/analisar-grafico', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setResult(response.data);
    } catch (err: any) {
      setError('Erro ao analisar gráfico.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>IA de Análise de Gráficos</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <FormControl fullWidth>
            <InputLabel>Timeframe</InputLabel>
            <Select value={timeframe} label="Timeframe" onChange={e => setTimeframe(e.target.value)}>
              {timeframes.map(tf => <MenuItem key={tf} value={tf}>{tf}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Ativo</InputLabel>
            <Select value={ativo} label="Ativo" onChange={e => setAtivo(e.target.value)}>
              {ativos.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSubmit} disabled={loading || !file}>
            {loading ? <CircularProgress size={24} /> : 'Analisar Gráfico'}
          </Button>
        </Box>
      </Paper>
      {error && <Typography color="error">{error}</Typography>}
      {result && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>Análise Completa</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{result.analise}</pre>
          <Box mt={2}>
            <Typography variant="h6">Decisão Final Sugerida:</Typography>
            <Typography variant="body1"><b>{result.decisao?.operacao?.toUpperCase() || '-'}</b> (Confiança: {result.decisao?.confianca || '-'})</Typography>
            <Typography variant="body2" color="text.secondary">{result.decisao?.justificativa}</Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default IaAnalysis; 