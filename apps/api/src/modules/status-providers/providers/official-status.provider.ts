import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OperationalStatus } from '@prisma/client';
import { StatusProvider } from '../status-provider.interface';
import { ExternalLineStatus } from '../status-provider.types';

interface ArtespStatus { situacao?:unknown;descricao?:unknown;classificacao?:unknown;operacao_normal?:unknown;atualizado_em?:unknown; }
interface ArtespLine { nome?:unknown;codigo?:unknown;ativa?:unknown;status?:ArtespStatus|null; }
interface ArtespCompany { id?:unknown;nome?:unknown;linhas?:unknown; }
interface ArtespResponse { empresas?:unknown; }

const lineCodes:Record<string,string>={1:'line-1-blue',2:'line-2-green',3:'line-3-red',4:'line-4-yellow',5:'line-5-lilac',7:'line-7-ruby',8:'line-8-diamond',9:'line-9-emerald',10:'line-10-turquoise',11:'line-11-coral',12:'line-12-sapphire',13:'line-13-jade',15:'line-15-silver'};
const normalized=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

@Injectable()
export class OfficialStatusProvider implements StatusProvider {
  readonly providerName = 'official';
  constructor(private readonly config:ConfigService){}
  async fetchStatuses():Promise<ExternalLineStatus[]>{
    const url=this.config.getOrThrow<string>('STATUS_SOURCE_URL');
    const apiKey=this.config.getOrThrow<string>('STATUS_SOURCE_API_KEY');
    const timeout=Number(this.config.get<number|string>('STATUS_REQUEST_TIMEOUT_MS',10000));
    let response:Response;
    try{response=await fetch(url,{method:'GET',headers:{Accept:'application/json',Authorization:`Api-Key ${apiKey}`},signal:AbortSignal.timeout(timeout)});}catch{throw new ServiceUnavailableException('Não foi possível consultar a ARTESP');}
    if(!response.ok)throw new ServiceUnavailableException(`ARTESP respondeu com HTTP ${response.status}`);
    let payload:unknown;try{payload=await response.json();}catch{throw new ServiceUnavailableException('ARTESP retornou uma resposta inválida');}
    return this.parseResponse(payload);
  }
  parseResponse(payload:unknown):ExternalLineStatus[]{
    if(!payload||typeof payload!=='object')throw new ServiceUnavailableException('Formato de resposta da ARTESP inválido');
    const companies=(payload as ArtespResponse).empresas;
    if(!Array.isArray(companies))throw new ServiceUnavailableException('Lista de empresas ausente na resposta da ARTESP');
    const result:ExternalLineStatus[]=[];
    for(const companyValue of companies){
      if(!companyValue||typeof companyValue!=='object')continue;
      const company=companyValue as ArtespCompany;if(!Array.isArray(company.linhas))continue;
      for(const lineValue of company.linhas){const parsed=this.parseLine(lineValue);if(parsed)result.push(parsed);}
    }
    if(result.length===0)throw new ServiceUnavailableException('ARTESP não retornou linhas reconhecidas');
    return result;
  }
  private parseLine(value:unknown):ExternalLineStatus|null{
    if(!value||typeof value!=='object')return null;const line=value as ArtespLine;
    const externalCode=(typeof line.codigo==='string'||typeof line.codigo==='number')?String(line.codigo).trim():'';const lineCode=lineCodes[externalCode];if(!lineCode||line.ativa===false||!line.status||typeof line.status!=='object')return null;
    const situation=typeof line.status.situacao==='string'?line.status.situacao.trim():'';
    const description=typeof line.status.descricao==='string'?line.status.descricao.trim():'';
    return{lineCode,status:this.mapStatus(line.status),description:description||situation||undefined,source:'artesp',sourceUpdatedAt:this.parseDate(line.status.atualizado_em)};
  }
  mapStatus(status:ArtespStatus):OperationalStatus{
    const situation=normalized(typeof status.situacao==='string'?status.situacao:'');
    const classification=normalized(typeof status.classificacao==='string'?status.classificacao:'');
    if(status.operacao_normal===true||classification==='operacional'||situation.includes('operacao normal'))return OperationalStatus.NORMAL;
    if(situation.includes('velocidade reduzida')||situation.includes('reducao de velocidade'))return OperationalStatus.REDUCED_SPEED;
    if(situation.includes('operacao parcial')||situation.includes('parcial'))return OperationalStatus.PARTIAL_OPERATION;
    if(situation.includes('interromp')||situation.includes('paralis')||situation.includes('suspens'))return OperationalStatus.INTERRUPTED;
    if(situation.includes('encerrad')||situation.includes('fechad'))return OperationalStatus.CLOSED;
    if(situation.includes('manutencao')||situation.includes('programad'))return OperationalStatus.PLANNED_MAINTENANCE;
    return OperationalStatus.UNKNOWN;
  }
  private parseDate(value:unknown):Date|undefined{
    if(typeof value!=='string'||!value.trim())return undefined;const raw=value.trim();const withZone=/([zZ]|[+-]\d{2}:?\d{2})$/.test(raw)?raw:`${raw}-03:00`;const date=new Date(withZone);return Number.isNaN(date.getTime())?undefined:date;
  }
}
