import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendOrderEmail(
    to: string,
    userName: string,
    cartItems: any[],
    total: number,
  ) {
    const itemsHTML = cartItems
      .map(
        (item) => `
        <tr>
          <td style="padding:8px;">${item.name}</td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">$${(item.price * item.quantity).toFixed(
            2,
          )}</td>
        </tr>`,
      )
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 14px;">
        <h2>Thank you for your order, ${userName}!</h2>
        <p>Here is your order summary:</p>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border-bottom:1px solid #ccc; padding:8px;">Product</th>
              <th style="border-bottom:1px solid #ccc; padding:8px;">Qty</th>
              <th style="border-bottom:1px solid #ccc; padding:8px;">Price</th>
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

    await this.resend.emails.send({
      from: 'onboarding@resend.dev', // replace with verified Resend sender
      to,
      subject: 'Your Order Confirmation',
      html: htmlContent,
    });
  }
}
