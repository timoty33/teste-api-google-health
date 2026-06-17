import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { dbClient } from '../../prisma/client.js';

export const auth = betterAuth({
  database: prismaAdapter(dbClient, {
    provider: 'sqlite'
  }),
  // Adicionamos o provedor do Google aqui para o Better Auth saber o que fazer
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }
});
