import 'dotenv/config';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from './generated/client.js';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? ''
});

export const dbClient = new PrismaClient({ adapter });
