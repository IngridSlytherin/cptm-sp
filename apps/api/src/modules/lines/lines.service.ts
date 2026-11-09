import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OperationalStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StatusCollectorService } from '../status-collector/status-collector.service';
import { HistoryQueryDto } from './dto/history-query.dto';

const labels:Record<OperationalStatus,string>={NORMAL:'Operação normal',REDUCED_SPEED:'Velocidade reduzida',PARTIAL_OPERATION:'Operação parcial',INTERRUPTED:'Operação interrompida',CLOSED:'Operação encerrada',PLANNED_MAINTENANCE:'Manutenção programada',UNKNOWN:'Situação não confirmada'};
export type Freshness='fresh'|'stale'|'unavailable'|'source_error';
@Injectable()
export class LinesService {
  constructor(private readonly prisma:PrismaService,private readonly config:ConfigService,private readonly collector:StatusCollectorService) {}
  freshness(lastCollectedAt:Date|null,sourceUpdatedAt:Date|null=null):Freshness { if(!lastCollectedAt)return'unavailable'; if(this.collector.getState().sourceState==='error')return'source_error'; const reference=sourceUpdatedAt??lastCollectedAt;return Date.now()-reference.getTime()>this.config.get<number>('STATUS_STALE_AFTER_SECONDS',180)*1000?'stale':'fresh'; }
  async list(){const lines=await this.prisma.railwayLine.findMany({where:{active:true},select:{code:true,number:true,name:true,operator:true,color:true}});return lines.sort((a,b)=>Number(a.number)-Number(b.number));}
  async statuses(){const lines=await this.prisma.railwayLine.findMany({where:{active:true}});lines.sort((a,b)=>Number(a.number)-Number(b.number));const state=this.collector.getState();return{data:lines.map(line=>({code:line.code,number:line.number,name:line.name,operator:line.operator,color:line.color,status:line.currentStatus,statusLabel:labels[line.currentStatus],description:line.currentDescription,source:line.currentSource,sourceUpdatedAt:line.sourceUpdatedAt,lastCollectedAt:line.lastCollectedAt,freshness:this.freshness(line.lastCollectedAt,line.sourceUpdatedAt)})),meta:{lastSuccessfulCollection:state.lastSuccess,provider:state.provider,sourceState:state.sourceState}};}
  async detail(code:string){const line=await this.prisma.railwayLine.findUnique({where:{code},include:{events:{orderBy:{collectedAt:'desc'},take:10}}});if(!line||!line.active)throw new NotFoundException('Linha não encontrada');return{...line,statusLabel:labels[line.currentStatus],freshness:this.freshness(line.lastCollectedAt,line.sourceUpdatedAt)};}
  async history(code:string,query:HistoryQueryDto){const line=await this.prisma.railwayLine.findUnique({where:{code},select:{id:true}});if(!line)throw new NotFoundException('Linha não encontrada');const where:Prisma.StatusEventWhereInput={lineId:line.id,status:query.status,collectedAt:{gte:query.from?new Date(query.from):undefined,lte:query.to?new Date(query.to):undefined}};const [data,total]=await Promise.all([this.prisma.statusEvent.findMany({where,orderBy:{collectedAt:'desc'},take:query.limit,skip:(query.page-1)*query.limit}),this.prisma.statusEvent.count({where})]);return{data,meta:{page:query.page,limit:query.limit,total}};}
}
