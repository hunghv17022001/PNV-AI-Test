import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import aiRoutes from './src/routes/aiRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI API is running' });
});

app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 AI API server đang chạy tại http://localhost:${PORT}`);
});

