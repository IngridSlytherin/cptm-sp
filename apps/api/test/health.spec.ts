import { Test } from '@nestjs/testing';
import { HealthController } from '../src/health/health.controller';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
describe('HealthController', () => {
  it('retorna saúde sem acessar serviços externos', async () => {
    const module = await Test.createTestingModule({controllers:[HealthController],providers:[{provide:PrismaService,useValue:{ping:jest.fn().mockResolvedValue(true)}},{provide:RedisService,useValue:{ping:jest.fn().mockResolvedValue(true)}}]}).compile();
    await expect(module.get(HealthController).health()).resolves.toMatchObject({status:'ok',database:'connected',redis:'connected'});
  });
  it('isola uma falha no banco', async () => {
    const module = await Test.createTestingModule({controllers:[HealthController],providers:[{provide:PrismaService,useValue:{ping:jest.fn().mockRejectedValue(new Error('offline'))}},{provide:RedisService,useValue:{ping:jest.fn().mockResolvedValue(true)}}]}).compile();
    await expect(module.get(HealthController).health()).resolves.toMatchObject({status:'degraded',database:'disconnected'});
  });
});
