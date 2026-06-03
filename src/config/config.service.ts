import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfigDto } from './dtos/update-config.dto';
import { GameStatus, Prisma } from '@prisma/client';
import { RankingSeasonDto } from './dtos/ranking-season.dto';

const SINGLETON_ID = 'singleton';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeAndValidateSeasons(
    seasons: RankingSeasonDto[],
  ): RankingSeasonDto[] {
    const normalized = seasons.map((season) => ({
      slug: season.slug.trim(),
      label: season.label.trim(),
      startDate: season.startDate,
      endDate: season.endDate,
    }));

    for (const season of normalized) {
      if (!season.slug || !season.label) {
        throw new BadRequestException(
          'Cada temporada deve ter slug e nome válidos!',
        );
      }

      if (season.startDate > season.endDate) {
        throw new BadRequestException(
          `A temporada "${season.label}" possui intervalo de datas inválido!`,
        );
      }
    }

    const duplicatedSlugs = normalized
      .map((season) => season.slug.toLowerCase())
      .filter((slug, index, all) => all.indexOf(slug) !== index);

    if (duplicatedSlugs.length > 0) {
      throw new BadRequestException(
        `Slug de temporada duplicado: ${duplicatedSlugs[0]}`,
      );
    }

    return normalized;
  }

  async get() {
    return this.prisma.config.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: {
        id: SINGLETON_ID,
        betCloseMinutesBefore: 30,
        rankingSeasons: [],
      },
    });
  }

  async update(dto: UpdateConfigDto) {
    const rankingSeasons = this.normalizeAndValidateSeasons(dto.rankingSeasons);
    const rankingSeasonsJson =
      rankingSeasons as unknown as Prisma.InputJsonValue;

    return this.prisma.$transaction(async (tx) => {
      const updatedConfig = await tx.config.upsert({
        where: { id: SINGLETON_ID },
        update: {
          betCloseMinutesBefore: dto.betCloseMinutesBefore,
          rankingSeasons: rankingSeasonsJson,
        },
        create: {
          id: SINGLETON_ID,
          betCloseMinutesBefore: dto.betCloseMinutesBefore,
          rankingSeasons: rankingSeasonsJson,
        },
      });

      // Recalcula o fechamento com base no gameDate para jogos ainda agendados.
      await tx.$executeRaw`
        UPDATE "Game"
        SET "betCloseAt" = "gameDate" - (${dto.betCloseMinutesBefore} * interval '1 minute')
        WHERE "status" = ${GameStatus.SCHEDULED}::"GameStatus"
      `;

      return updatedConfig;
    });
  }
}
