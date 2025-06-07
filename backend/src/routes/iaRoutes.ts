import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { analisarGraficoIA } from '../config/iaService';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/analyze-chart', upload.single('image'), async (req, res) => {
  const { timeframe, ativo } = req.body;
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: 'Arquivo não enviado' });
  try {
    const result = await analisarGraficoIA(filePath, timeframe, ativo);
    fs.unlinkSync(filePath); // remove arquivo temporário
    return res.json(result);
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(500).json({ error: 'Erro ao processar imagem IA' });
  }
});

export default router; 