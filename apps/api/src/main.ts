import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { VersioningType, StandardSchemaValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exeception.filter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('JournalPilot API')
    .setDescription('JournalPilot REST API')
    .setVersion('1.0')
    .build();

  const swaggerDocument = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    useGlobalPrefix: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(new StandardSchemaValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
