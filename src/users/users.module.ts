import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthController } from '../auth/auth.controller';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { environments } from 'eslint-plugin-prettier';
import * as process from 'process';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
