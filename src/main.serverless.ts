// main.serverless.ts
import { Handler, Context, Callback } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let server: Handler;

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors();
  await app.init();
  server = serverlessExpress({ app: expressApp });
}

bootstrap();

export const handler = async (event: any, context: Context, callback: Callback) => {
  if (!server) {
    await bootstrap();
  }
  return server(event, context, callback);
};
