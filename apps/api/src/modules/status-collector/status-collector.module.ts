import { Module } from '@nestjs/common';
import { StatusProviderModule } from '../status-providers/status-provider.module';
import { StatusCollectorService } from './status-collector.service';
@Module({imports:[StatusProviderModule],providers:[StatusCollectorService],exports:[StatusCollectorService]})
export class StatusCollectorModule {}
