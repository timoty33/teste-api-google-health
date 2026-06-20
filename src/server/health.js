import { auth } from './auth.js';

export async function healthHandlers(app) {
  app.decorateRequest('healthClient', null); // <- importante

  app.addHook('preHandler', auth);

  app.get('/metricas/corpo', async (req, res) => {
    if (!req.healthClient) {
      return res.status(500).send({ error: 'healthClient não inicializado' });
    }

    const dataSources = await req.healthClient.users.dataTypes.dataPoints.list({
      parent: 'users/me/dataTypes/steps'
    });

    return res.status(200).send(dataSources.data);
  });
}
