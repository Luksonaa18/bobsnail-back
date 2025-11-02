import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';

// Define a custom request type that includes `user`
interface JwtRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: JwtRequest) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('add')
  addToCart(
    @Req() req: JwtRequest,
    @Body() body: { productId: string; quantity?: number },
  ) {
    console.log(body);
    return this.cartService.addToCart(
      req.user.id,
      body.productId,
      body.quantity,
    );
  }

  @Delete('remove/:productId')
  removeFromCart(@Req() req: JwtRequest, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(req.user.id, productId);
  }

  @Delete('clear')
  clearCart(@Req() req: JwtRequest) {
    return this.cartService.clearCart(req.user.id);
  }
}
