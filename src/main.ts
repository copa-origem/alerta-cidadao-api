import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as admin from 'firebase-admin'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //activate the validation
  app.useGlobalPipes(new ValidationPipe());

  admin.initializeApp({
    credential: admin.credential.cert('./firebase-config.json'),
  });

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
