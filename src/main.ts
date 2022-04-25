import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = await app.get(ConfigService);
  app.use(cookieParser());
  const svconfig = new DocumentBuilder()
    .setTitle('Video app')
    .setDescription('The video API description')
    .setVersion('1.0')
    .addTag('video')
    .build();
  const document = SwaggerModule.createDocument(app, svconfig);
  SwaggerModule.setup('swagger', app, document);
  process.env.SECRET_KEY = config.get<string>('SECRET_KEY');
  const port = config.get<number>('API_PORT');
  await app.listen(port || 3000, () => {
    console.log('Server is running on port ' + port);
  });
}
bootstrap();
