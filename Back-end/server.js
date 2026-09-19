import 'dotenv/config';
import dns from 'dns';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import config from './config/config.js';
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { initSocket } from './socket.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const httpServer = http.createServer(app);

const clientOrigin =
  process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: clientOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();


app.set('io', initSocket(httpServer, clientOrigin));

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/messages', messageRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

httpServer.listen(config.port, () => {
  console.log(`${config.appName} is running on port ${config.port}`);
});
