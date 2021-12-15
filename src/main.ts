import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

declare const module: any;

async function bootstrap() {
  const docsOptions = new DocumentBuilder()
  .setTitle('some api')
  .setVersion('0.0.1')
  .build();

  const app = await NestFactory.create(AppModule);

  const swag = SwaggerModule.createDocument(app, docsOptions);
  SwaggerModule.setup('docs', app, swag);
  await app.listen(8081);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close())
  }
}
bootstrap();
