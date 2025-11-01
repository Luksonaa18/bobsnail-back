// src/main.serverless.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';
import { Handler, Context, Callback } from 'aws-lambda';

let cachedHandler: Handler;

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors();
  await app.init();
  cachedHandler = serverlessExpress({ app: expressApp });
}

bootstrap();

export const handler = async (event: any, context: Context, callback: Callback) => {
  if (!cachedHandler) {
    await bootstrap();
  }
  return cachedHandler(event, context, callback);
};
