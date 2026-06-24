import { auth } from "./auth.js";

export async function healthHandlers(app) {
  app.decorateRequest("healthClient", null); // <- importante

  app.addHook("preHandler", auth);

  app.get("/metricas/corpo", async (req, res) => {
    if (!req.healthClient) {
      return res.status(500).send({ error: "healthClient não inicializado" });
    }

    const weightSource = await req.healthClient.users.dataTypes.dataPoints.list(
      {
        parent: "users/me/dataTypes/weight",
      },
    );
    const weight = weightSource.data;

    const heightSource = await req.healthClient.users.dataTypes.dataPoints.list(
      {
        parent: "users/me/dataTypes/height",
      },
    );
    const height = heightSource.data;

    const bodyFatSource = await req.healthClient.users.dataTypes.dataPoints.list(
      {
        parent: "users/me/dataTypes/height",
      },
    );
    const bodyFat = bodyFatSource.data;

    const bodyData = {
      weight,
      height,
      bodyFat
    }

    return res.status(200).send(dataSources.data);
  });
}
