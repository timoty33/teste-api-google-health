import 'dotenv/config.js';
import { app } from './src/server/index.js';

app.listen({ port: 3000 }, (err, _) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
