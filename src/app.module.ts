import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { BetModule } from './bet/bet.module';
import { BlogPostModule } from './blog-post/blog-post.module';
import { UserScoreModule } from './user-score/user-score.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    GameModule,
    BetModule,
    BlogPostModule,
    UserScoreModule,
    AuthModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
