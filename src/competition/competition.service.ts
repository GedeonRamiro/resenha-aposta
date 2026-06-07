import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompetitionDto } from './dtos/create-competition.dto';
import { UpdateCompetitionDto } from './dtos/update-competition.dto';
import { ReturnCompetitionPagination } from './interface/return-competition-pagination';
import { createPagination } from 'src/utils/pagination';

@Injectable()
export class CompetitionService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertNameIsAvailable(name: string, excludeId?: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { name },
    });

    if (competition && competition.id !== excludeId) {
      throw new ConflictException('Já existe uma competição com esse nome.');
    }
  }

  async getAll(
    limit: number,
    page: number,
  ): Promise<ReturnCompetitionPagination> {
    if (isNaN(Number(page)) || isNaN(Number(limit))) {
      throw new NotAcceptableException('Página ou limite formato inválido!');
    }

    const skip = (page - 1) * limit;
    const count = await this.prisma.competition.count();
    const data = await this.prisma.competition.findMany({
      take: limit,
      skip,
      orderBy: [{ name: 'asc' }],
    });

    return {
      data,
      ...createPagination(limit, page, count),
    };
  }

  async findOne(id: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id },
    });

    if (!competition) {
      throw new NotFoundException('Competição não encontrada!');
    }

    return competition;
  }

  async create(dto: CreateCompetitionDto) {
    const name = dto.name.trim();

    await this.assertNameIsAvailable(name);

    return this.prisma.competition.create({
      data: {
        name,
        logoUrl: dto.logoUrl,
      },
    });
  }

  async update(id: string, dto: UpdateCompetitionDto) {
    await this.findOne(id);

    const nextName = dto.name?.trim();

    if (nextName) {
      await this.assertNameIsAvailable(nextName, id);
    }

    return this.prisma.competition.update({
      where: { id },
      data: {
        name: nextName,
        logoUrl: dto.logoUrl,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const linkedGamesCount = await this.prisma.game.count({
      where: {
        competitionId: id,
      },
    });

    if (linkedGamesCount > 0) {
      throw new BadRequestException(
        'Não é possível excluir esta competição porque ela está vinculada a jogos cadastrados.',
      );
    }

    return this.prisma.competition.delete({
      where: { id },
    });
  }
}
