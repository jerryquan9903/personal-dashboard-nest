import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fs from 'fs';

async function bootstrap() {
  const docsOptions = new DocumentBuilder()
  .setTitle('some api')
  .setVersion('0.0.1')
  .build();

  const httpsOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/certificate.pem'),
  };

  const app = await NestFactory.create(AppModule, {
    // httpsOptions
  });

  const swag = SwaggerModule.createDocument(app, docsOptions);
  SwaggerModule.setup('docs', app, swag);
  await app.listen(8081, '0.0.0.0');

  // if (module.hot) {
  //   module.hot.accept();
  //   module.hot.dispose(() => app.close())
  // }
}
bootstrap();
