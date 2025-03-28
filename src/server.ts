import express from 'express';
import http from 'http';
import { generateMockData } from 'lib/mocksData';
import { Server } from 'socket.io';
import { GetChats } from './controller/chat-controller';
import { getUserController } from './controller/user-controller';
import type { User } from '@prisma/client';

const app = express();

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const io = new Server(server, { cors: { origin: '¨*' } });

app.get('/', async (req, res) => {
  const user: User[] = await getUserController();
  const data = await GetChats(user[2]?.id ?? '');
  console.log({ data });
  res.status(200).json({ msg: 'ok' });
});

app.get('/mock', async (req, res) => {
  await generateMockData().catch((e) => {
    console.error(e);
  });
  console.log('Mock data generation complete!');
  res.json({ message: 'Mock data generation complete!' });
});

io.on('connection', (socket) => {
  console.log(`usuario conectado, ${socket.id}`);
});

server.listen(PORT, () => {
  console.log(`listening on PORT: ${PORT}`);
});
