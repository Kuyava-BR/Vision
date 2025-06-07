import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Button,
  Grid,
  useTheme,
} from '@mui/material';
import { CloudUpload, Analytics, Timeline, Insights } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import API_URL from '../config/api';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const UploadBox = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.action.hover,
  },
}));

const StepBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(1),
}));

const ChartAnalysis = () => {
  const theme = useTheme();
  const [marketType, setMarketType] = useState('crypto');
  const [timeframe, setTimeframe] = useState('1d');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('marketType', marketType);
    formData.append('timeframe', timeframe);

    try {
      const response = await fetch(`${API_URL}/api/ia/analyze-chart`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Análise de Gráficos de Criptomoedas
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Carregue uma imagem de gráfico de criptomoeda e selecione o tipo de mercado e o período para uma análise precisa. Nossa
          IA analisará padrões e fornecerá recomendações de negociação personalizadas de acordo com os parâmetros selecionados.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selecione o tipo de mercado
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup row value={marketType} onChange={(e) => setMarketType(e.target.value)}>
                <FormControlLabel value="crypto" control={<Radio />} label="Criptomoeda" />
                <FormControlLabel value="forex" control={<Radio />} label="Forex" />
                <FormControlLabel value="stocks" control={<Radio />} label="Ações" />
                <FormControlLabel value="commodities" control={<Radio />} label="Commodities" />
                <FormControlLabel value="indices" control={<Radio />} label="Índices" />
              </RadioGroup>
            </FormControl>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selecione o período do gráfico
            </Typography>
            <FormControl fullWidth>
              <Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <MenuItem value="1d">1 dia</MenuItem>
                <MenuItem value="4h">4 horas</MenuItem>
                <MenuItem value="1h">1 hora</MenuItem>
                <MenuItem value="15m">15 minutos</MenuItem>
                <MenuItem value="5m">5 minutos</MenuItem>
                <MenuItem value="1m">1 minuto</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              O período de tempo afeta como a análise interpreta padrões e gera sinais
            </Typography>
          </Paper>

          <UploadBox
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {imagePreview ? (
              <Box sx={{ width: '100%', position: 'relative' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                  }}
                >
                  ×
                </IconButton>
              </Box>
            ) : (
              <>
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Carregar gráfico de criptomoedas
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Arraste e solte a imagem do seu gráfico aqui
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ou
                </Typography>
                <Button
                  component="label"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  clique para navegar
                  <VisuallyHiddenInput type="file" onChange={handleImageUpload} accept="image/*" />
                </Button>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 2 }}>
                  Formatos suportados: PNG, JPG, JPEG (máx. 5 MB)
                </Typography>
              </>
            )}
          </UploadBox>

          {selectedImage && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleAnalyze}
                startIcon={<Analytics />}
              >
                Analisar Gráfico
              </Button>
            </Box>
          )}

          {loading && <Typography>Analisando...</Typography>}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Como funciona
            </Typography>
            
            <StepBox>
              <CloudUpload sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h6">1. Carregar</Typography>
              <Typography variant="body2" color="textSecondary">
                Carregue qualquer imagem de gráfico de criptomoeda de plataformas de negociação ou capturas de tela.
              </Typography>
            </StepBox>

            <StepBox>
              <Timeline sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h6">2. Analisar</Typography>
              <Typography variant="body2" color="textSecondary">
                Nossa IA analisa o gráfico para identificar padrões, indicadores e níveis de suporte/resistência.
              </Typography>
            </StepBox>

            <StepBox>
              <Insights sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h6">3. Obtenha insights</Typography>
              <Typography variant="body2" color="textSecondary">
                Receba análises detalhadas com reconhecimento de padrões e recomendações de negociação.
              </Typography>
            </StepBox>
          </Paper>

          {analysisResult && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h5" gutterBottom>Resultado da Análise</Typography>
              <Typography><strong>Sugestão:</strong> {analysisResult.sugestao} (Confiança: {Math.round(analysisResult.confianca * 100)}%)</Typography>
              <Typography><strong>Tendência:</strong> {analysisResult.tendencia}</Typography>
              <Typography><strong>Padrão Identificado:</strong> {analysisResult.padrao_identificado}</Typography>
              <Typography><strong>Suporte Chave:</strong> {analysisResult.niveis_chave.suporte}</Typography>
              <Typography><strong>Resistência Chave:</strong> {analysisResult.niveis_chave.resistencia}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Indicadores Técnicos:</Typography>
                <Typography><strong>RSI:</strong> {analysisResult.indicadores.rsi}</Typography>
                <Typography><strong>MACD:</strong> {analysisResult.indicadores.macd}</Typography>
                <Typography><strong>Volume:</strong> {analysisResult.indicadores.volume}</Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChartAnalysis; 