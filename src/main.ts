import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:3001', // Next.js frontend
      'http://localhost:5173', // Vite frontend
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const config =
    new DocumentBuilder()
      .setTitle('Acadues Cafe API')
      .setDescription('Cafe management backend')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

  const document =
    SwaggerModule.createDocument(
      app,
      config,
    );

  SwaggerModule.setup(
    'api',
    app,
    document,
  );

  await app.listen(process.env.PORT ?? 3000);

  printRoutes(app);
}

function printRoutes(app: INestApplication) {

  const server =
    app.getHttpAdapter().getInstance();

  const router = server._router;

  if (!router) {

    console.log(
      "Router stack not available (Fastify or new Express).",
    );

    return;

  }

  console.log("\nRegistered Routes:\n");

  router.stack.forEach(layer => {

    if (layer.route) {

      const path =
        layer.route.path;

      const method =
        Object.keys(layer.route.methods)[0]
          .toUpperCase();

      console.log(method, path);

    }

  });

}
bootstrap();
