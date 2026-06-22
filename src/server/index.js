import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { authHandlers } from './auth.js';
import { healthHandlers } from './health.js';
import { peopleHandlers } from './people.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({
  logger: true
});

app.register(fastifyStatic, {
  root: path.join(__dirname, '../../frontend/public/'),
  prefix: '/public/'
});

await app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET
});

await app.register(authHandlers, { prefix: '/api/auth' });

await app.register(healthHandlers, { prefix: '/api/health' });

await app.register(peopleHandlers, { prefix: '/api/people' });

app.get('/', (_, res) => {
  res.send({ hello: 'world' });
});

app.get('/welcome', (_, res) => {
  return res.sendFile('welcome.html');
});

export { app };
