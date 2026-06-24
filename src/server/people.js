import { auth } from "./auth.js";

export async function getNames(req, res) {
  const response = await req.peopleClient.people.get({
    resourceName: "people/me",
    personFields: "names",
  });

  return response;
}

export async function getProfilePhoto(req, res) {
  const response = await req.peopleClient.people.get({
    resourceName: "people/me",
    personFields: "photo",
  });

  return response;
}

export async function getGender(req, res) {
  const response = await req.peopleClient.people.get({
    resourceName: "people/me",
    personFields: "genders",
  });

  return response;
}

export async function getBirthday(req, res) {
  const response = await req.peopleClient.people.get({
    resourceName: "people/me",
    personFields: "birthdays",
  });

  return response;
}

export async function peopleHandlers(app) {
  app.addHook("preHandler", auth);

  app.get("/names", async (req, res) => {
    if (!req.peopleClient) {
      return res.status(500).send({ error: "peopleClient não inicializado" });
    }

    const response = await getNames(req, res);

    res.status(200).send(response.data);
  });

  app.get("/photo", async (req, res) => {
    if (!req.peopleClient) {
      return res.status(500).send({ error: "peopleClient não inicializado" });
    }

    const response = await getProfilePhoto(req, res);

    res.status(200).send(response.data);
  });

  app.get("/gender", async (req, res) => {
    if (!req.peopleClient) {
      return res.status(500).send({ error: "peopleClient não inicializado" });
    }

    const response = await getGender(req, res);

    res.status(200).send(response.data);
  });

  app.get("/birthday", async (req, res) => {
    if (!req.peopleClient) {
      return res.status(500).send({ error: "peopleClient não inicializado" });
    }

    const response = await getBirthday(req, res);

    res.status(200).send(response.data);
  });
}
