import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { Resend } from 'resend';
import { CreateCheckoutDto } from 'src/dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!);
  }

  async sendOrderEmail(dto: CreateCheckoutDto) {
    const { user, cartItems, total } = dto;

    if (!user?.email || !cartItems?.length) {
      throw new BadRequestException('Invalid data');
    }

    const itemsHTML = cartItems
      .map(
        (item) => `
      <tr>
        <td style="padding:6px; border-bottom:1px solid #ccc;">${item.name}</td>
        <td style="text-align:center; border-bottom:1px solid #ccc;">${item.quantity}</td>
        <td style="text-align:right; border-bottom:1px solid #ccc;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 14px;">
        <h2>Thank you for your order, ${user.name}!</h2>
        <p>Here is your order summary:</p>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align:left; padding:6px; border-bottom:1px solid #ccc;">Product</th>
              <th style="text-align:center; padding:6px; border-bottom:1px solid #ccc;">Qty</th>
              <th style="text-align:right; padding:6px; border-bottom:1px solid #ccc;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        <p><strong>Total: $${total.toFixed(2)}</strong></p>
        <p>Order Time: ${new Date().toLocaleString()}</p>
      </div>
    `;

    try {
      await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: user.email,
        subject: 'Your Order Confirmation',
        html: htmlContent,
      });

      return { message: 'Email sent successfully' };
    } catch (err) {
      console.error('❌ Error sending email:', err);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
