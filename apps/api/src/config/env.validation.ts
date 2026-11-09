import 'reflect-metadata';
import { plainToInstance, Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min, ValidateIf, validateSync } from 'class-validator';
class EnvironmentVariables {
  @IsIn(['development','test','production']) NODE_ENV = 'development';
  @Type(() => Number) @IsInt() @Min(1) API_PORT = 3001;
  @IsString() @IsNotEmpty() CORS_ORIGIN!: string;
  @IsUrl({ require_tld: false, protocols: ['postgresql'] }) DATABASE_URL!: string;
  @IsUrl({ require_tld: false, protocols: ['redis','rediss'] }) REDIS_URL!: string;
  @Type(() => Number) @IsInt() @Min(1000) RATE_LIMIT_TTL = 60000;
  @Type(() => Number) @IsInt() @Min(1) RATE_LIMIT_LIMIT = 100;
  @IsOptional() @IsString() DOMAIN?: string;
  @IsIn(['mock','official']) STATUS_PROVIDER = 'mock';
  @ValidateIf((value: EnvironmentVariables) => value.STATUS_PROVIDER === 'official') @IsUrl({require_tld:false}) STATUS_SOURCE_URL?: string;
  @IsOptional() @IsString() STATUS_SOURCE_API_KEY?: string;
  @Type(() => Number) @IsInt() @Min(300) STATUS_COLLECTION_INTERVAL_SECONDS = 300;
  @Type(() => Number) @IsInt() @Min(10) STATUS_STALE_AFTER_SECONDS = 180;
  @Type(() => Number) @IsInt() @Min(100) STATUS_REQUEST_TIMEOUT_MS = 10000;
  @IsIn(['normal','incident','source-error','stale']) MOCK_STATUS_SCENARIO = 'normal';
  @IsOptional() @IsString() INTERNAL_COLLECTION_KEY?: string;
}
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length) throw new Error(`Configuração de ambiente inválida: ${errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('; ')}`);
  return validated;
}
