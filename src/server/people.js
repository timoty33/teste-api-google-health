import { auth } from './auth.js';

export async function peopleHandlers(app) {
  app.addHook('preHandler', auth);

  app.get('/names', async (req, res) => {
    if (!req.peopleClient) {
      return res.status(500).send({ error: 'peopleClient não inicializado' });
    }

    const response = await req.peopleClient.people.get({
      resourceName: 'people/me',
      personFields: 'names'
    });

    res.status(200).send(response.data);
  });

  app.get('/photo', async (req, res) => {
    if (!req.peopleClient) {
      return res.status(500).send({ error: 'peopleClient não inicializado' });
    }

    const response = await req.peopleClient.people.get({
      resourceName: 'people/me',
      personFields: 'photos'
    });

    res.status(200).send(response.data);
  });

  app.get('/gender', async (req, res) => {
    if (!req.peopleClient) {
      return res.status(500).send({ error: 'peopleClient não inicializado' });
    }

    const response = await req.peopleClient.people.get({
      resourceName: 'people/me',
      personFields: 'genders'
    });

    res.status(200).send(response.data);
  });

  app.get('/birthday', async (req, res) => {
    if (!req.peopleClient) {
      return res.status(500).send({ error: 'peopleClient não inicializado' });
    }

    const response = await req.peopleClient.people.get({
      resourceName: 'people/me',
      personFields: 'birthdays'
    });

    res.status(200).send(response.data);
  });
}
