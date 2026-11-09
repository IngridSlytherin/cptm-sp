import 'reflect-metadata';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs:true });
  const config = app.get(ConfigService);
  app.use(pinoHttp({ redact:['req.headers.authorization','req.headers.cookie'] }));
  app.use(helmet());
  app.enableCors({ origin:config.getOrThrow<string>('CORS_ORIGIN').split(',').map((v)=>v.trim()), credentials:false, methods:['GET','POST','HEAD','OPTIONS'] });
  app.setGlobalPrefix('api');
  app.enableVersioning({type:VersioningType.URI,defaultVersion:'1'});
  app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Rail Status API').setVersion('1').build());
  SwaggerModule.setup('api/docs', app, document, {customSiteTitle:'Rail Status API Docs'});
  const port = config.getOrThrow<number>('API_PORT');
  await app.listen(port, '0.0.0.0');
  Logger.log(`API iniciada na porta ${port}`, 'Bootstrap');
}
void bootstrap();
