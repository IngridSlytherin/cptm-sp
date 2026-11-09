import { Module } from '@nestjs/common';
import { StatusCollectorModule } from '../status-collector/status-collector.module';
import { StatusController } from './status.controller';
@Module({imports:[StatusCollectorModule],controllers:[StatusController]})export class StatusModule{}
