import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OperationalStatus } from '@prisma/client';
import { StatusProvider } from '../status-provider.interface';
import { ExternalLineStatus } from '../status-provider.types';

const lineCodes = ['line-1-blue','line-2-green','line-3-red','line-4-yellow','line-5-lilac','line-7-ruby','line-8-diamond','line-9-emerald','line-10-turquoise','line-11-coral','line-12-sapphire','line-13-jade','line-15-silver'];

@Injectable()
export class MockStatusProvider implements StatusProvider {
  readonly providerName = 'mock';
  private readonly referenceTime = new Date();
  constructor(private readonly config: ConfigService) {}
  fetchStatuses(): Promise<ExternalLineStatus[]> {
    const scenario = this.config.get<string>('MOCK_STATUS_SCENARIO','normal');
    if (scenario === 'source-error') return Promise.reject(new ServiceUnavailableException('Fonte mock indisponível'));
    const now = scenario === 'stale' ? new Date(this.referenceTime.getTime() - 3_600_000) : this.referenceTime;
    const statuses = lineCodes.map((lineCode):ExternalLineStatus=>({lineCode,status:OperationalStatus.NORMAL,description:'Operação normal',source:'mock',sourceUpdatedAt:now}));
    if (scenario === 'incident') {
      Object.assign(statuses[6],{status:OperationalStatus.REDUCED_SPEED,description:'Interferência na circulação',sourceEventId:'mock-incident-8'});
      Object.assign(statuses[8],{status:OperationalStatus.PARTIAL_OPERATION,description:'Operação parcial entre estações',sourceEventId:'mock-incident-10'});
      Object.assign(statuses[10],{status:OperationalStatus.INTERRUPTED,description:'Circulação temporariamente interrompida',sourceEventId:'mock-incident-12'});
      statuses.push({lineCode:'line-99-unknown',status:OperationalStatus.UNKNOWN,description:'Linha desconhecida para teste',source:'mock',sourceUpdatedAt:now});
    }
    return Promise.resolve(statuses);
  }
}
