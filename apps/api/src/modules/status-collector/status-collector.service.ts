import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OperationalStatus, RailwayLine } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { STATUS_PROVIDER, StatusProvider } from '../status-providers/status-provider.interface';
import { ExternalLineStatus } from '../status-providers/status-provider.types';

export type SourceState = 'available'|'error'|'unavailable';
export interface CollectorState { provider:string; lastAttempt:string|null; lastSuccess:string|null; lastError:string|null; sourceState:SourceState; latencyMs:number|null; }
const keys = {current:'rail-status:current',success:'rail-status:last-success',error:'rail-status:last-error',lock:'rail-status:collector-lock'};

@Injectable()
export class StatusCollectorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StatusCollectorService.name);
  private running = false;
  private timer?: NodeJS.Timeout;
  private startupTimer?: NodeJS.Timeout;
  private state: CollectorState;
  constructor(@Inject(STATUS_PROVIDER) private readonly provider:StatusProvider,private readonly prisma:PrismaService,private readonly redis:RedisService,private readonly config:ConfigService) {
    this.state={provider:provider.providerName,lastAttempt:null,lastSuccess:null,lastError:null,sourceState:'unavailable',latencyMs:null};
  }
  async onModuleInit(): Promise<void> { const [lastSuccess,lastError]=await Promise.all([this.redis.get(keys.success),this.redis.get(keys.error)]);this.state.lastSuccess=lastSuccess;this.state.lastError=lastError?this.errorDate(lastError):null;this.state.sourceState=lastError?'error':lastSuccess?'available':'unavailable';const seconds=this.config.get<number>('STATUS_COLLECTION_INTERVAL_SECONDS',300); this.timer=setInterval(()=>void this.collect().catch(()=>undefined),seconds*1000); this.timer.unref();this.startupTimer=setTimeout(()=>void this.collect().catch(()=>undefined),1000);this.startupTimer.unref(); }
  onModuleDestroy(): void { if(this.timer) clearInterval(this.timer);if(this.startupTimer)clearTimeout(this.startupTimer); }
  getState():CollectorState { return {...this.state}; }
  private errorDate(raw:string):string|null{try{return (JSON.parse(raw) as {at?:string}).at??null;}catch{return null;}}
  normalize(item:ExternalLineStatus):ExternalLineStatus {
    if (!item.lineCode || !Object.values(OperationalStatus).includes(item.status)) throw new Error('Status externo inválido');
    const description=item.description?.replace(/\s+/g,' ').trim();
    return {...item,lineCode:item.lineCode.trim(),description:description || undefined,source:item.source.trim(),sourceUpdatedAt:item.sourceUpdatedAt ? new Date(item.sourceUpdatedAt) : undefined};
  }
  hasRelevantChange(line:RailwayLine & {currentSourceEventId?:string|null},item:ExternalLineStatus):boolean {
    return line.currentStatus!==item.status || (line.currentDescription??null)!==(item.description??null) || (line.currentSourceEventId??null)!==(item.sourceEventId??null) || line.sourceUpdatedAt?.getTime()!==(item.sourceUpdatedAt?.getTime());
  }
  async collect():Promise<{collected:number;changed:number;ignored:number}> {
    if(this.running) return {collected:0,changed:0,ignored:0};
    this.running=true;
    const lockValue=randomUUID(); let redisLocked=false; const started=Date.now(); this.state.lastAttempt=new Date().toISOString();
    try {
      try { if(await this.redis.ping()) { redisLocked=await this.redis.acquireLock(keys.lock,lockValue,Math.max(30,this.config.get<number>('STATUS_COLLECTION_INTERVAL_SECONDS',300))); if(!redisLocked) return {collected:0,changed:0,ignored:0}; } } catch { this.logger.warn('Redis indisponível; coleta seguirá sem lock distribuído'); }
      const timeout=this.config.get<number>('STATUS_REQUEST_TIMEOUT_MS',10000);
      const raw=await Promise.race([this.provider.fetchStatuses(),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('Timeout da fonte de status')),timeout))]);
      let changed=0,ignored=0; const normalized:ExternalLineStatus[]=[];
      for(const candidate of raw) {
        try { const item=this.normalize(candidate); const didChange=await this.processLine(item); normalized.push(item); if(didChange) changed++; }
        catch(error:unknown) { ignored++; this.logger.warn(`Linha externa ignorada: ${error instanceof Error?error.message:'erro inválido'}`); }
      }
      const success=new Date().toISOString(); this.state={...this.state,lastSuccess:success,lastError:null,sourceState:'available',latencyMs:Date.now()-started};
      await Promise.all([this.redis.set(keys.current,JSON.stringify(normalized)),this.redis.set(keys.success,success),this.redis.set(keys.error,'')]);
      return {collected:normalized.length,changed,ignored};
    } catch(error:unknown) {
      const message=error instanceof Error?error.message:'Falha desconhecida'; this.state={...this.state,lastError:new Date().toISOString(),sourceState:'error',latencyMs:Date.now()-started};
      await this.redis.set(keys.error,JSON.stringify({at:this.state.lastError,message:'Falha ao consultar a fonte'})); this.logger.error(`Coleta falhou: ${message}`); throw error;
    } finally { if(redisLocked) await this.redis.releaseLock(keys.lock,lockValue); this.running=false; }
  }
  private async processLine(item:ExternalLineStatus):Promise<boolean> {
    const line=await this.prisma.railwayLine.findUnique({where:{code:item.lineCode}});
    if(!line) throw new Error(`linha desconhecida: ${item.lineCode}`);
    const now=new Date(); const changed=this.hasRelevantChange(line,item);
    await this.prisma.$transaction(async(tx)=>{
      await tx.railwayLine.update({where:{id:line.id},data:{currentStatus:item.status,currentDescription:item.description??null,currentSource:item.source,currentSourceEventId:item.sourceEventId??null,sourceUpdatedAt:item.sourceUpdatedAt,lastCollectedAt:now}});
      if(changed) {
        await tx.statusEvent.updateMany({where:{lineId:line.id,endedAt:null},data:{endedAt:item.sourceUpdatedAt??now}});
        await tx.statusEvent.create({data:{lineId:line.id,status:item.status,description:item.description,source:item.source,sourceEventId:item.sourceEventId,sourceUpdatedAt:item.sourceUpdatedAt,startedAt:item.sourceUpdatedAt??now,collectedAt:now}});
      }
    });
    return changed;
  }
}
