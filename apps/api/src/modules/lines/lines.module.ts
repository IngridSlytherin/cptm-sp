import { Module } from '@nestjs/common';
import { StatusCollectorModule } from '../status-collector/status-collector.module';
import { LinesController } from './lines.controller';
import { LinesService } from './lines.service';
@Module({imports:[StatusCollectorModule],controllers:[LinesController],providers:[LinesService],exports:[LinesService]}) export class LinesModule{}
