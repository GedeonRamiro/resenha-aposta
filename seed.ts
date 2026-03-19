import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  // Criar usuários
  const user1 = await prisma.user.create({
    data: { name: 'João', email: 'joao@example.com' },
  });

  const user2 = await prisma.user.create({
    data: { name: 'Maria', email: 'maria@example.com' },
  });

  const user3 = await prisma.user.create({
    data: { name: 'Pedro', email: 'pedro@example.com' },
  });

  // Criar jogo
  const game = await prisma.game.create({
    data: {
      homeTeam: 'Flamengo',
      awayTeam: 'Vasco',
      gameDate: new Date('2026-03-20T16:00:00Z'),
      betCloseAt: new Date('2026-03-20T15:00:00Z'),
    },
  });

  // Criar apostas
  await prisma.bet.create({
    data: { userId: user1.id, gameId: game.id, option: 'HOME_WIN' }, // João aposta vitória casa
  });

  await prisma.bet.create({
    data: { userId: user2.id, gameId: game.id, option: 'DRAW' }, // Maria aposta empate
  });

  await prisma.bet.create({
    data: { userId: user3.id, gameId: game.id, option: 'AWAY_WIN' }, // Pedro aposta vitória visitante
  });

  console.log('Dados de teste criados!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
