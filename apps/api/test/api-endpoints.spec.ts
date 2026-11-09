import { ConfigService } from '@nestjs/config';
import { OperationalStatus } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { LinesController } from '../src/modules/lines/lines.controller';
import { LinesService } from '../src/modules/lines/lines.service';
import { StatusController } from '../src/modules/status/status.controller';
import { StatusCollectorService } from '../src/modules/status-collector/status-collector.service';
describe('API principal',()=>{
  it('encaminha listagem e status de linhas',async()=>{const service={list:jest.fn().mockResolvedValue([{code:'line-1-blue'}]),statuses:jest.fn().mockResolvedValue({data:[],meta:{}})} as unknown as LinesService;const controller=new LinesController(service);await expect(controller.list()).resolves.toEqual([{code:'line-1-blue'}]);await expect(controller.statuses()).resolves.toHaveProperty('data');});
  it('retorna resumo e permite coleta manual em desenvolvimento',async()=>{const collector={getState:()=>({lastSuccess:null,sourceState:'available'}),collect:jest.fn().mockResolvedValue({collected:13,changed:0,ignored:0})} as unknown as StatusCollectorService;const prisma={railwayLine:{groupBy:jest.fn().mockResolvedValue([{currentStatus:OperationalStatus.NORMAL,_count:{_all:13}}])}} as unknown as PrismaService;const config={get:(key:string)=>key==='NODE_ENV'?'development':undefined} as ConfigService;const controller=new StatusController(collector,prisma,config);await expect(controller.summary()).resolves.toMatchObject({normal:13,problems:0,total:13});await expect(controller.collect()).resolves.toMatchObject({collected:13});});
});
