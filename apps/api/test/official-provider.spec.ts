/* Jest matchers intentionally inspect the untyped fetch options object. */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConfigService } from '@nestjs/config';
import { OperationalStatus } from '@prisma/client';
import { OfficialStatusProvider } from '../src/modules/status-providers/providers/official-status.provider';

describe('OfficialStatusProvider',()=>{
  const fixture={meta:{versao:'1.0.0'},empresas:[{id:102,nome:'Metrô de São Paulo',linhas:[{nome:'Linha 1-Azul',codigo:'1',ativa:true,status:{situacao:'Operação Normal',descricao:'Operação Normal',classificacao:'operacional',operacao_normal:true,atualizado_em:'2026-08-06T10:17:17.701278'}},{nome:'Linha 3-Vermelha',codigo:'3',ativa:true,status:{situacao:'Velocidade reduzida',descricao:'Interferência na circulação',classificacao:'problema',operacao_normal:false,atualizado_em:'2026-08-06T10:20:00-03:00'}}]}]};
  const config={getOrThrow:(key:string)=>key==='STATUS_SOURCE_URL'?'https://example.test/status/':'test-key',get:()=>10000} as unknown as ConfigService;
  afterEach(()=>jest.restoreAllMocks());
  it('converte a estrutura oficial para o modelo normalizado',()=>{const result=new OfficialStatusProvider(config).parseResponse(fixture);expect(result).toEqual(expect.arrayContaining([expect.objectContaining({lineCode:'line-1-blue',status:OperationalStatus.NORMAL,source:'artesp'}),expect.objectContaining({lineCode:'line-3-red',status:OperationalStatus.REDUCED_SPEED,description:'Interferência na circulação'})]));expect(result[0].sourceUpdatedAt?.toISOString()).toBe('2026-08-06T13:17:17.701Z');});
  it('mapeia estados conhecidos e preserva desconhecidos como UNKNOWN',()=>{const provider=new OfficialStatusProvider(config);expect(provider.mapStatus({situacao:'Operação parcial'})).toBe(OperationalStatus.PARTIAL_OPERATION);expect(provider.mapStatus({situacao:'Circulação interrompida'})).toBe(OperationalStatus.INTERRUPTED);expect(provider.mapStatus({situacao:'Manutenção programada'})).toBe(OperationalStatus.PLANNED_MAINTENANCE);expect(provider.mapStatus({situacao:'Novo estado futuro'})).toBe(OperationalStatus.UNKNOWN);});
  it('envia a chave no header Authorization sem incorporá-la ao código',async()=>{const fetchMock=jest.spyOn(global,'fetch').mockResolvedValue({ok:true,json:jest.fn().mockResolvedValue(fixture)} as unknown as Response);await new OfficialStatusProvider(config).fetchStatuses();expect(fetchMock).toHaveBeenCalledWith('https://example.test/status/',expect.objectContaining({headers:expect.objectContaining({Authorization:'Api-Key test-key'})}));});
  it('rejeita respostas sem a estrutura oficial',()=>expect(()=>new OfficialStatusProvider(config).parseResponse({items:[]})).toThrow('Lista de empresas ausente'));
});
