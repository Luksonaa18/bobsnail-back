import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { UserModule } from './user/user.module';
import { CheckoutModule } from './checkout/checkout.module';
import { EmailModule } from './email/email.module';
import { AwsModule } from './aws/aws.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          connection.on('connected', () =>
            console.log('Mongoose connected successfully'),
          );
          connection.on('error', (err: Error) =>
            console.error('Mongoose connection error:', err),
          );
          return connection;
        },
      }),
    }),
    AuthModule,
    ProductsModule,
    CartModule,
    UserModule,
    CheckoutModule,
    EmailModule,
    AwsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
