import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = await app.get(ConfigService);
  process.env.SECRET_KEY = config.get<string>('SECRET_KEY');
  const port = config.get<number>('API_PORT');
  await app.listen(port || 3000, () => {
    console.log('Server is running on port ' + port);
  });
}
bootstrap();
