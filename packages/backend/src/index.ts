import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { config } from './config/index.js';
import { generalLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

export const prisma = new PrismaClient();

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());

app.use(generalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

async function main() {
  await prisma.$connect();
  console.log('Connected to database');

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
