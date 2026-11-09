import { Controller, ForbiddenException, Get, Headers, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OperationalStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StatusCollectorService } from '../status-collector/status-collector.service';
@ApiTags('status') @Controller({path:'status',version:'1'})
export class StatusController {
  constructor(private readonly collector:StatusCollectorService,private readonly prisma:PrismaService,private readonly config:ConfigService){}
  @Get('summary') @ApiOperation({summary:'Resumo operacional das linhas'}) async summary(){const grouped=await this.prisma.railwayLine.groupBy({by:['currentStatus'],where:{active:true},_count:{_all:true}});const count=(s:OperationalStatus)=>grouped.find(v=>v.currentStatus===s)?._count._all??0;const normal=count(OperationalStatus.NORMAL);const withoutData=count(OperationalStatus.UNKNOWN);const total=grouped.reduce((sum,v)=>sum+v._count._all,0);const state=this.collector.getState();return{normal,problems:total-normal-withoutData,withoutData,total,lastCollection:state.lastSuccess,sourceState:state.sourceState};}
  @Post('collect') @ApiOperation({summary:'Executa coleta manual (desenvolvimento ou chave interna)'}) @ApiHeader({name:'x-internal-key',required:false}) async collect(@Headers('x-internal-key')key?:string){if(this.config.get('NODE_ENV')==='production'&&(!this.config.get('INTERNAL_COLLECTION_KEY')||key!==this.config.get('INTERNAL_COLLECTION_KEY')))throw new ForbiddenException('Coleta manual desabilitada');return this.collector.collect();}
  @Get('source-health') @ApiOperation({summary:'Estado da fonte de dados'}) sourceHealth(){return this.collector.getState();}
}
