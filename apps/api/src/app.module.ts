import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { validate } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { LinesModule } from './modules/lines/lines.module';
import { StatusModule } from './modules/status/status.module';
import { resolve } from 'node:path';
@Module({ imports:[ConfigModule.forRoot({isGlobal:true,validate,envFilePath:[resolve(process.cwd(),'.env'),resolve(process.cwd(),'../../.env')]}), ThrottlerModule.forRootAsync({inject:[ConfigService],useFactory:(c:ConfigService)=>[{ttl:c.getOrThrow<number>('RATE_LIMIT_TTL'),limit:c.getOrThrow<number>('RATE_LIMIT_LIMIT')}]}), PrismaModule, RedisModule, HealthModule,LinesModule,StatusModule], providers:[{provide:APP_GUARD,useClass:ThrottlerGuard}] })
export class AppModule {}
