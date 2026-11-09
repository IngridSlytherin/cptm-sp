import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../src/prisma/prisma.service';
import { LinesService } from '../src/modules/lines/lines.service';
import { HistoryQueryDto } from '../src/modules/lines/dto/history-query.dto';
import { StatusCollectorService } from '../src/modules/status-collector/status-collector.service';
describe('LinesService',()=>{
  const prisma={} as PrismaService;const config={get:()=>180} as unknown as ConfigService;
  it('classifica fresh, stale e unavailable',()=>{const collector={getState:()=>({sourceState:'available'})} as StatusCollectorService;const service=new LinesService(prisma,config,collector);expect(service.freshness(new Date())).toBe('fresh');expect(service.freshness(new Date(Date.now()-181000))).toBe('stale');expect(service.freshness(null)).toBe('unavailable');});
  it('classifica source_error sem apagar o dado',()=>{const collector={getState:()=>({sourceState:'error'})} as StatusCollectorService;expect(new LinesService(prisma,config,collector).freshness(new Date())).toBe('source_error');});
  it('valida query parameters de histórico',async()=>{const dto=plainToInstance(HistoryQueryDto,{limit:500,status:'INVALID'},{enableImplicitConversion:true});expect((await validate(dto)).length).toBeGreaterThan(0);});
});
