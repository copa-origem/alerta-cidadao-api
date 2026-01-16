import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as admin from 'firebase-admin'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672'],
      queue: 'problems_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672'],
      queue: 'reports_queue',
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  admin.initializeApp({
    credential: admin.credential.cert('./firebase-config.json'),
  });
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Alerta Cidadão API')
    .setDescription('The API to manage urban problems and comunity vote.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
