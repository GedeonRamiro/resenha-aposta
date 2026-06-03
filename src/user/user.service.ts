import {
  Injectable,
  NotFoundException,
  NotAcceptableException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ReturnUserPagination } from './interface/return-user-pagination';
import { createPagination } from 'src/utils/pagination';

type UserWithBetsAndGameRelations = Prisma.UserGetPayload<{
  include: {
    bets: {
      include: {
        game: {
          include: {
            homeTeamRef: true;
            awayTeamRef: true;
            competitionRef: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private mapUserResponse(user: UserWithBetsAndGameRelations) {
    return {
      ...user,
      bets: user.bets.map((bet) => {
        const { homeTeamRef, awayTeamRef, competitionRef, ...gameWithoutRefs } =
          bet.game;

        return {
          ...bet,
          game: {
            ...gameWithoutRefs,
            homeTeam: homeTeamRef?.name ?? '',
            awayTeam: awayTeamRef?.name ?? '',
            homeTeamLogo: homeTeamRef?.logoUrl ?? null,
            awayTeamLogo: awayTeamRef?.logoUrl ?? null,
            competition: competitionRef?.name ?? null,
          },
        };
      }),
    };
  }

  async create(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: createUserDto,
    });
  }

  async getAll(limit: number, page: number): Promise<ReturnUserPagination> {
    if (isNaN(Number(page)) || isNaN(Number(limit))) {
      throw new NotAcceptableException('Página ou limite formato inválido!');
    }

    const skip = (page - 1) * limit;

    const count = await this.prisma.user.count();

    const users = await this.prisma.user.findMany({
      take: limit,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        bets: {
          include: {
            game: {
              include: {
                homeTeamRef: true,
                awayTeamRef: true,
                competitionRef: true,
              },
            },
          },
        },
      },
    });

    const pagination = createPagination(limit, page, count);

    return {
      data: users.map((user) => this.mapUserResponse(user)),
      ...pagination,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        bets: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            game: {
              include: {
                homeTeamRef: true,
                awayTeamRef: true,
                competitionRef: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    return this.mapUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    if (!updateUserDto.role) {
      throw new BadRequestException('Informe o perfil para atualizar!');
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        role: updateUserDto.role,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async existEmail(email: string, excludeId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.id !== excludeId) {
      throw new ConflictException('Email já cadastrado!');
    }

    return true;
  }
}
