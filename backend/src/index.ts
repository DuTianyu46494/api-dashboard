import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './models/database';
import authRoutes from './routes/auth';
import apiConfigRoutes from './routes/apiConfig';
import usageRoutes from './routes/usage';
import alertRoutes from './routes/alerts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/configs', apiConfigRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/alerts', alertRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
async function start() {
  try {
    await initDatabase();
    console.log('数据库初始化完成');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

start();

export default app;
