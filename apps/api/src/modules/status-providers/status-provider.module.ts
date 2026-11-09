import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STATUS_PROVIDER } from './status-provider.interface';
import { MockStatusProvider } from './providers/mock-status.provider';
import { OfficialStatusProvider } from './providers/official-status.provider';

@Module({
  providers:[MockStatusProvider,OfficialStatusProvider,{provide:STATUS_PROVIDER,inject:[ConfigService,MockStatusProvider,OfficialStatusProvider],useFactory:(config:ConfigService,mock:MockStatusProvider,official:OfficialStatusProvider)=>config.get('STATUS_PROVIDER') === 'official' ? official : mock}],
  exports:[STATUS_PROVIDER],
})
export class StatusProviderModule {}
