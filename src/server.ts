import express from 'express';
import cors from 'cors';
import http from 'http';
import { generateMockData } from 'lib/mocksData';
import { Server } from 'socket.io';
import { GetChats } from './controller/chat-controller';
import { getUserController } from './controller/user-controller';
import type { User } from '@prisma/client';

const app = express();
app.use(cors());
// const conversacion = [
//   { name: 'Ana', message: 'Hola chicos, ¿cómo están?' },
//   { name: 'Luis', message: '¡Hola Ana! Estoy bien, ¿y tú?' },
//   { name: 'Carlos', message: 'Hola a ambos, yo también estoy bien.' },
//   { name: 'Ana', message: 'Me alegra saberlo. ¿Qué planes tienen para hoy?' },
//   { name: 'Luis', message: 'Pensaba ir al cine, ¿quieren venir?' },
//   { name: 'Carlos', message: '¡Buena idea! ¿Qué película veremos?' },
//   { name: 'Ana', message: 'Me gustaría ver una de acción.' },
//   {
//     name: 'Luis',
//     message: 'Genial, hay una nueva que dicen que es muy buena.',
//   },
//   {
//     name: 'Carlos',
//     message: 'Entonces quedamos en vernos en el cine a las 7.',
//   },
//   { name: 'Ana', message: 'Perfecto, nos vemos allá.' },
// ];

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const io = new Server(server, { cors: { origin: '*' } });

app.get('/', async (req, res) => {
  const user: User[] = await getUserController();
  const data = await GetChats(user[0]?.id ?? '');
  if (data) console.log({ data: data[0]?.participants });
  res.status(200).json({ msg: 'ok' });
});

app.get('/users', async (req, res) => {
  const users: User[] = await getUserController();
  res.json({ msg: 'all users', users }).status(200);
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

  socket.on('connected', async (userID: string) => {
    const messages = await GetChats(userID);
    socket.emit('messages', messages);
  });

  socket.on('sendMessage', (data) => {
    console.log(data);
    io.emit('new_message', data);
  });
});

server.listen(PORT, () => {
  console.log(`listening on PORT: ${PORT}`);
});
