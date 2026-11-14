import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { VersioningType, StandardSchemaValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exeception.filter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
