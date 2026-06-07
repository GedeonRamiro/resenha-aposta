import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dtos/create-team.dto';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { ReturnTeamPagination } from './interface/return-team-pagination';
import { createPagination } from 'src/utils/pagination';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertNameIsAvailable(name: string, excludeId?: string) {
    const team = await this.prisma.team.findUnique({
      where: { name },
    });

    if (team && team.id !== excludeId) {
      throw new ConflictException('Já existe um time com esse nome.');
    }
  }

  async getAll(limit: number, page: number): Promise<ReturnTeamPagination> {
    if (isNaN(Number(page)) || isNaN(Number(limit))) {
      throw new NotAcceptableException('Página ou limite formato inválido!');
    }

    const skip = (page - 1) * limit;
    const count = await this.prisma.team.count();
    const data = await this.prisma.team.findMany({
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
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException('Time não encontrado!');
    }

    return team;
  }

  async create(dto: CreateTeamDto) {
    const name = dto.name.trim();

    await this.assertNameIsAvailable(name);

    return this.prisma.team.create({
      data: {
        name,
        logoUrl: dto.logoUrl,
      },
    });
  }

  async update(id: string, dto: UpdateTeamDto) {
    await this.findOne(id);

    const nextName = dto.name?.trim();

    if (nextName) {
      await this.assertNameIsAvailable(nextName, id);
    }

    return this.prisma.team.update({
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
        OR: [{ homeTeamId: id }, { awayTeamId: id }],
      },
    });

    if (linkedGamesCount > 0) {
      throw new BadRequestException(
        'Não é possível excluir este time porque ele está vinculado a jogos cadastrados.',
      );
    }

    return this.prisma.team.delete({
      where: { id },
    });
  }
}
