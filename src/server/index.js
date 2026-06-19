import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import Fastify from 'fastify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({
  logger: true
});

app.register(fastifyStatic, {
  root: path.join(__dirname, '../../frontend/public/'),
  prefix: '/public/'
});

app.register(swagger, {
  openapi: {
    info: {
      title: 'Teste API do Google Health',
      version: '1.0.0'
    }
  }
});

app.register(swaggerUI, {
  routePrefix: '/docs'
});

app.get('/', (_, res) => {
  res.send({ hello: 'world' });
});

app.get('/welcome', (_, res) => {
  return res.sendFile('welcome.html');
});

export { app };
