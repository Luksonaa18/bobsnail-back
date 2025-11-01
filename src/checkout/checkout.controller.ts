// src/checkout/checkout.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async checkout(@Body() body: any) {
    const { user, cartItems, total } = body;

    if (!user?.email || !cartItems?.length) {
      return { error: 'Invalid data' };
    }

    try {
      await this.emailService.sendOrderEmail(user.email, user.name, cartItems, total);
      return { message: 'Checkout successful, email sent!' };
    } catch (error) {
      console.error('Email send error:', error);
      return { error: 'Failed to send email' };
    }
  }
}
