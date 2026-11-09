/* Test doubles intentionally model only the Prisma methods exercised here. */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { OperationalStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
import { StatusCollectorService } from '../src/modules/status-collector/status-collector.service';
import { StatusProvider } from '../src/modules/status-providers/status-provider.interface';

describe('StatusCollectorService',()=>{
  const config={get:(key:string,fallback:unknown)=>({STATUS_REQUEST_TIMEOUT_MS:1000,STATUS_COLLECTION_INTERVAL_SECONDS:60}[key]??fallback)} as ConfigService;
  function setup(status:OperationalStatus=OperationalStatus.UNKNOWN){const tx={railwayLine:{update:jest.fn()},statusEvent:{updateMany:jest.fn(),create:jest.fn()}};const prisma={railwayLine:{findUnique:jest.fn().mockResolvedValue({id:'1',code:'line-1-blue',currentStatus:status,currentDescription:null,currentSourceEventId:null,sourceUpdatedAt:null})},$transaction:jest.fn(async(callback:(client:typeof tx)=>Promise<void>)=>callback(tx))} as unknown as PrismaService;const redis={ping:jest.fn().mockRejectedValue(new Error('offline')),set:jest.fn().mockResolvedValue(false),releaseLock:jest.fn()} as unknown as RedisService;const provider={providerName:'mock',fetchStatuses:jest.fn().mockResolvedValue([{lineCode:'line-1-blue',status:OperationalStatus.NORMAL,description:'  Operação   normal ',source:'mock'}])} satisfies StatusProvider;return{service:new StatusCollectorService(provider,prisma,redis,config),provider,tx,prisma};}
  it('normaliza descrições e valida status',()=>{const{service}=setup();expect(service.normalize({lineCode:' x ',status:OperationalStatus.NORMAL,description:' a   b ',source:' mock '})).toMatchObject({lineCode:'x',description:'a b',source:'mock'});});
  it('cria evento somente quando há mudança',async()=>{const first=setup();await first.service.collect();expect(first.tx.statusEvent.create).toHaveBeenCalledTimes(1);const unchanged=setup(OperationalStatus.NORMAL);unchanged.prisma.railwayLine.findUnique=jest.fn().mockResolvedValue({id:'1',currentStatus:OperationalStatus.NORMAL,currentDescription:'Operação normal',currentSourceEventId:null,sourceUpdatedAt:null});await unchanged.service.collect();expect(unchanged.tx.statusEvent.create).not.toHaveBeenCalled();});
  it('registra retorno a NORMAL e finaliza evento anterior',async()=>{const{service,tx}=setup(OperationalStatus.INTERRUPTED);await service.collect();expect(tx.statusEvent.updateMany).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({endedAt:expect.any(Date)})}));expect(tx.statusEvent.create).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({status:OperationalStatus.NORMAL})}));});
  it('mantém estado de erro quando a fonte falha',async()=>{const{service,provider}=setup();provider.fetchStatuses=jest.fn().mockRejectedValue(new Error('indisponível'));await expect(service.collect()).rejects.toThrow('indisponível');expect(service.getState().sourceState).toBe('error');});
});
