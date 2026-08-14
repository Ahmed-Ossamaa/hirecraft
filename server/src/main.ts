import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const baseUrl = configService.get<string>('app.baseUrl');
  const port = configService.get<number>('app.port')!;
  const apiPrefix = configService.get<string>('app.apiPrefix');

  const corsOptions = {
    origin: configService.get<string>('app.clientURL'),
    credentials: true,
  };

  app.setGlobalPrefix(apiPrefix!);
  app.enableCors(corsOptions);
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Technically HiringF Platform API')
    .setDescription('API for SaaS Hiring Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  Logger.log(`Application is running on: ${baseUrl}/${apiPrefix}`, 'Bootstrap');
}
bootstrap();
