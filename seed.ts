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
  // Criar jogo
  await prisma.game.create({
    data: {
      homeTeamRef: {
        connectOrCreate: {
          where: { name: 'Botafogo' },
          create: { name: 'Botafogo' },
        },
      },
      awayTeamRef: {
        connectOrCreate: {
          where: { name: 'Mirassol' },
          create: { name: 'Mirassol' },
        },
      },
      competitionRef: {
        connectOrCreate: {
          where: { name: 'Campeonato Brasileiro Série A' },
          create: { name: 'Campeonato Brasileiro Série A' },
        },
      },
      gameDate: new Date('2026-04-01T22:30:00Z'),
      betCloseAt: new Date('2026-04-01T22:20:00Z'),
      moreInfo: `
🏆 Competição
Campeonato Brasileiro Série A

🗓️ Data e horário
01/04/2026 — 19:30

📺 Transmissão
Premiere

⚽ Jogo
Botafogo de Futebol e Regatas x Mirassol Futebol Clube

📊 Análise
O Botafogo chega como favorito jogando em casa e com elenco mais qualificado. O Mirassol tenta surpreender apostando em organização tática.

📈 Probabilidade
Botafogo: 55%
Empate: 25%
Mirassol: 20%
`,
    },
  });

  await prisma.game.create({
    data: {
      homeTeamRef: {
        connectOrCreate: {
          where: { name: 'Internacional' },
          create: { name: 'Internacional' },
        },
      },
      awayTeamRef: {
        connectOrCreate: {
          where: { name: 'São Paulo' },
          create: { name: 'São Paulo' },
        },
      },
      competitionRef: {
        connectOrCreate: {
          where: { name: 'Campeonato Brasileiro Série A' },
          create: { name: 'Campeonato Brasileiro Série A' },
        },
      },
      gameDate: new Date('2026-04-01T22:30:00Z'),
      betCloseAt: new Date('2026-04-01T22:20:00Z'),
      moreInfo: `
🏆 Competição
Campeonato Brasileiro Série A

🗓️ Data e horário
01/04/2026 — 19:30

📺 Transmissão
Record, CazéTV e Premiere

⚽ Jogo
Sport Club Internacional x São Paulo Futebol Clube

📊 Análise
Duelo entre dois clubes tradicionais do futebol brasileiro. O Internacional costuma ser forte no Beira-Rio, enquanto o São Paulo aposta na qualidade técnica do elenco.

📈 Probabilidade
Internacional: 40%
Empate: 30%
São Paulo: 30%
`,
    },
  });

  await prisma.game.create({
    data: {
      homeTeamRef: {
        connectOrCreate: {
          where: { name: 'Bahia' },
          create: { name: 'Bahia' },
        },
      },
      awayTeamRef: {
        connectOrCreate: {
          where: { name: 'Athletico-PR' },
          create: { name: 'Athletico-PR' },
        },
      },
      competitionRef: {
        connectOrCreate: {
          where: { name: 'Campeonato Brasileiro Série A' },
          create: { name: 'Campeonato Brasileiro Série A' },
        },
      },
      gameDate: new Date('2026-04-01T23:00:00Z'),
      betCloseAt: new Date('2026-04-01T22:50:00Z'),
      moreInfo: `
🏆 Competição
Campeonato Brasileiro Série A

🗓️ Data e horário
01/04/2026 — 20:00

📺 Transmissão
Premiere

⚽ Jogo
Esporte Clube Bahia x Club Athletico Paranaense

📊 Análise
Confronto equilibrado. O Bahia costuma crescer diante da torcida na Fonte Nova, enquanto o Athletico-PR tem um time competitivo e organizado.

📈 Probabilidade
Bahia: 35%
Empate: 30%
Athletico-PR: 35%
`,
    },
  });

  await prisma.game.create({
    data: {
      homeTeamRef: {
        connectOrCreate: {
          where: { name: 'Cruzeiro' },
          create: { name: 'Cruzeiro' },
        },
      },
      awayTeamRef: {
        connectOrCreate: {
          where: { name: 'Vitória' },
          create: { name: 'Vitória' },
        },
      },
      competitionRef: {
        connectOrCreate: {
          where: { name: 'Campeonato Brasileiro Série A' },
          create: { name: 'Campeonato Brasileiro Série A' },
        },
      },
      gameDate: new Date('2026-04-01T23:00:00Z'),
      betCloseAt: new Date('2026-04-01T22:50:00Z'),
      moreInfo: `
🏆 Competição
Campeonato Brasileiro Série A

🗓️ Data e horário
01/04/2026 — 20:00

📺 Transmissão
Premiere

⚽ Jogo
Cruzeiro Esporte Clube x Esporte Clube Vitória

📊 Análise
O Cruzeiro entra como favorito jogando no Mineirão. O Vitória tenta pontuar fora de casa apostando em contra-ataques.

📈 Probabilidade
Cruzeiro: 50%
Empate: 25%
Vitória: 25%
`,
    },
  });

  await prisma.game.create({
    data: {
      homeTeamRef: {
        connectOrCreate: {
          where: { name: 'Coritiba' },
          create: { name: 'Coritiba' },
        },
      },
      awayTeamRef: {
        connectOrCreate: {
          where: { name: 'Vasco' },
          create: { name: 'Vasco' },
        },
      },
      competitionRef: {
        connectOrCreate: {
          where: { name: 'Campeonato Brasileiro Série A' },
          create: { name: 'Campeonato Brasileiro Série A' },
        },
      },
      gameDate: new Date('2026-04-01T23:30:00Z'),
      betCloseAt: new Date('2026-04-01T23:20:00Z'),
      moreInfo: `
🏆 Competição
Campeonato Brasileiro Série A

🗓️ Data e horário
01/04/2026 — 20:30

📺 Transmissão
SporTV e Premiere

⚽ Jogo
Coritiba Foot Ball Club x Club de Regatas Vasco da Gama

📊 Análise
Partida equilibrada. O Coritiba tenta aproveitar o fator casa no Couto Pereira, enquanto o Vasco busca pontuar fora.

📈 Probabilidade
Coritiba: 35%
Empate: 30%
Vasco: 35%
`,
    },
  });

  await prisma.game.create({
    data: {
      homeTeamRef: {
        connectOrCreate: {
          where: { name: 'Fluminense' },
          create: { name: 'Fluminense' },
        },
      },
      awayTeamRef: {
        connectOrCreate: {
          where: { name: 'Corinthians' },
          create: { name: 'Corinthians' },
        },
      },
      competitionRef: {
        connectOrCreate: {
          where: { name: 'Campeonato Brasileiro Série A' },
          create: { name: 'Campeonato Brasileiro Série A' },
        },
      },
      gameDate: new Date('2026-04-02T00:30:00Z'),
      betCloseAt: new Date('2026-04-02T00:20:00Z'),
      moreInfo: `
🏆 Competição
Campeonato Brasileiro Série A

🗓️ Data e horário
01/04/2026 — 21:30

📺 Transmissão
Amazon Prime Video

⚽ Jogo
Fluminense Football Club x Sport Club Corinthians Paulista

📊 Análise
Duelo de gigantes do futebol brasileiro. O Fluminense aposta na posse de bola e organização, enquanto o Corinthians busca eficiência ofensiva.

📈 Probabilidade
Fluminense: 40%
Empate: 30%
Corinthians: 30%
`,
    },
  });

  await prisma.game.create({
    data: {
      homeTeamRef: {
        connectOrCreate: {
          where: { name: 'América-MG' },
          create: { name: 'América-MG' },
        },
      },
      awayTeamRef: {
        connectOrCreate: {
          where: { name: 'Botafogo-SP' },
          create: { name: 'Botafogo-SP' },
        },
      },
      competitionRef: {
        connectOrCreate: {
          where: { name: 'Campeonato Brasileiro Série B' },
          create: { name: 'Campeonato Brasileiro Série B' },
        },
      },
      gameDate: new Date('2026-04-01T21:00:00Z'),
      betCloseAt: new Date('2026-04-01T20:50:00Z'),
      moreInfo: `
🏆 Competição
Campeonato Brasileiro Série B

🗓️ Data e horário
01/04/2026 — 18:00

📺 Transmissão
ESPN e Disney+

⚽ Jogo
América Futebol Clube x Botafogo Futebol Clube (SP)

📊 Análise
O América-MG entra como favorito pelo elenco mais forte e experiência na competição. O Botafogo-SP tenta surpreender.

📈 Probabilidade
América-MG: 50%
Empate: 25%
Botafogo-SP: 25%
`,
    },
  });

  await prisma.game.create({
    data: {
      homeTeamRef: {
        connectOrCreate: {
          where: { name: 'Sport' },
          create: { name: 'Sport' },
        },
      },
      awayTeamRef: {
        connectOrCreate: {
          where: { name: 'Vila Nova' },
          create: { name: 'Vila Nova' },
        },
      },
      competitionRef: {
        connectOrCreate: {
          where: { name: 'Campeonato Brasileiro Série B' },
          create: { name: 'Campeonato Brasileiro Série B' },
        },
      },
      gameDate: new Date('2026-04-01T22:00:00Z'),
      betCloseAt: new Date('2026-04-01T21:50:00Z'),
      moreInfo: `
🏆 Competição
Campeonato Brasileiro Série B

🗓️ Data e horário
01/04/2026 — 19:00

📺 Transmissão
Disney+

⚽ Jogo
Sport Club do Recife x Vila Nova Futebol Clube

📊 Análise
O Sport costuma ser muito forte na Ilha do Retiro. O Vila Nova aposta em organização defensiva para buscar pontos.

📈 Probabilidade
Sport: 50%
Empate: 25%
Vila Nova: 25%
`,
    },
  });

  await prisma.game.create({
    data: {
      homeTeamRef: {
        connectOrCreate: {
          where: { name: 'CRB' },
          create: { name: 'CRB' },
        },
      },
      awayTeamRef: {
        connectOrCreate: {
          where: { name: 'Avaí' },
          create: { name: 'Avaí' },
        },
      },
      competitionRef: {
        connectOrCreate: {
          where: { name: 'Campeonato Brasileiro Série B' },
          create: { name: 'Campeonato Brasileiro Série B' },
        },
      },
      gameDate: new Date('2026-04-02T00:30:00Z'),
      betCloseAt: new Date('2026-04-02T00:20:00Z'),
      moreInfo: `
🏆 Competição
Campeonato Brasileiro Série B

🗓️ Data e horário
01/04/2026 — 21:30

📺 Transmissão
Disney+

⚽ Jogo
Clube de Regatas Brasil x Avaí Futebol Clube

📊 Análise
Confronto equilibrado entre duas equipes tradicionais da Série B. O CRB costuma aproveitar bem o fator casa.

📈 Probabilidade
CRB: 40%
Empate: 30%
Avaí: 30%
`,
    },
  });

  await prisma.game.create({
    data: {
      homeTeamRef: {
        connectOrCreate: {
          where: { name: 'Ponte Preta' },
          create: { name: 'Ponte Preta' },
        },
      },
      awayTeamRef: {
        connectOrCreate: {
          where: { name: 'Ceará' },
          create: { name: 'Ceará' },
        },
      },
      competitionRef: {
        connectOrCreate: {
          where: { name: 'Campeonato Brasileiro Série B' },
          create: { name: 'Campeonato Brasileiro Série B' },
        },
      },
      gameDate: new Date('2026-04-02T00:00:00Z'),
      betCloseAt: new Date('2026-04-01T23:50:00Z'),
      moreInfo: `
🏆 Competição
Campeonato Brasileiro Série B

🗓️ Data e horário
01/04/2026 — 21:00

📺 Transmissão
ESPN, X Sports, Sportynet e Disney+

⚽ Jogo
Associação Atlética Ponte Preta x Ceará Sporting Club

📊 Análise
Jogo equilibrado entre equipes tradicionais da Série B. O Ceará possui elenco competitivo, enquanto a Ponte Preta aposta no fator casa.

📈 Probabilidade
Ponte Preta: 35%
Empate: 30%
Ceará: 35%
`,
    },
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
