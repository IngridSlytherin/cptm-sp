import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { HistoryQueryDto } from './dto/history-query.dto';
import { LinesService } from './lines.service';
@ApiTags('lines') @Controller({path:'lines',version:'1'})
export class LinesController {
  constructor(private readonly lines:LinesService){}
  @Get() @ApiOperation({summary:'Lista as linhas ativas'}) list(){return this.lines.list();}
  @Get('status') @ApiOperation({summary:'Lista a situação atual de todas as linhas'}) statuses(){return this.lines.statuses();}
  @Get(':code') @ApiOperation({summary:'Detalhes e histórico recente de uma linha'}) @ApiParam({name:'code'}) detail(@Param('code')code:string){return this.lines.detail(code);}
  @Get(':code/history') @ApiOperation({summary:'Histórico paginado de uma linha'}) history(@Param('code')code:string,@Query()query:HistoryQueryDto){return this.lines.history(code,query);}
}
