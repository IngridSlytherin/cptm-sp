import { ApiPropertyOptional } from '@nestjs/swagger';
import { OperationalStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class HistoryQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?:string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?:string;
  @ApiPropertyOptional({enum:OperationalStatus}) @IsOptional() @IsEnum(OperationalStatus) status?:OperationalStatus;
  @ApiPropertyOptional({default:20,maximum:100}) @Type(()=>Number) @IsInt() @Min(1) @Max(100) limit=20;
  @ApiPropertyOptional({default:1}) @Type(()=>Number) @IsInt() @Min(1) page=1;
}
