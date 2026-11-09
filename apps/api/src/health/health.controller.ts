import { Controller, Get, ServiceUnavailableException, Version } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
@ApiTags('health') @Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}
  private async state(check: () => Promise<boolean>): Promise<'connected'|'disconnected'> { try { return await check() ? 'connected' : 'disconnected'; } catch { return 'disconnected'; } }
  @Get() @Version('1') @ApiOperation({summary:'Saúde geral da API'})
  async health() { const [database, redis] = await Promise.all([this.state(() => this.prisma.ping()), this.state(() => this.redis.ping())]); return { status: database === 'connected' && redis === 'connected' ? 'ok' : 'degraded', service:'rail-status-api', timestamp:new Date().toISOString(), database, redis }; }
  @Get('database') @Version('1') async database() { const database = await this.state(() => this.prisma.ping()); if (database === 'disconnected') throw new ServiceUnavailableException('Banco de dados indisponível'); return { status:'ok', database }; }
  @Get('redis') @Version('1') async redisHealth() { const redis = await this.state(() => this.redis.ping()); if (redis === 'disconnected') throw new ServiceUnavailableException('Redis indisponível'); return { status:'ok', redis }; }
}
