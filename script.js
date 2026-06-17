import 'dotenv/config.js';
import { dbClient } from './prisma/client.js';

async function main() {
  console.log('Criando Usuário');
  await dbClient.user.create({
    data: {
      name: 'Sofia',
      email: 'sofia@exemplo.com',
      emailVerified: true, // O Better Auth exige este booleano
      image: 'https://avatars.githubusercontent.com/u/205840593?v=4'
    }
  });

  console.log('Passou da func');
}

main()
  .catch((erro) => {
    console.error('❌ Erro ao criar usuário:', erro);
  })
  .finally(async () => {
    // Fecha a conexão com o banco de dados ao terminar
    await dbClient.$disconnect();
  });
