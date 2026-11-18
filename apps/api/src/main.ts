import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { VersioningType, StandardSchemaValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exeception.filter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import './config/env.js';

async function bootstrap() {
  console.log('[startup] Creating Nest application');
  const app = await NestFactory.create(AppModule);
  console.log('[startup] Nest application created');

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('JournalPilot API')
    .setDescription('JournalPilot REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    useGlobalPrefix: true,
  });

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(new StandardSchemaValidationPipe());

  console.log('[startup] Listening for HTTP requests');
  await app.listen(process.env.PORT ?? 3001);
  console.log(`[startup] API listening on ${process.env.PORT ?? 3001}`);
}
await bootstrap();
