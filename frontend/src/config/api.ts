const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://vision-backend.up.railway.app' // URL do backend em produção
  : 'http://localhost:5000'; // URL do backend em desenvolvimento

export default API_URL; 