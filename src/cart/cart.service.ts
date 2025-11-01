import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schema/cart.schema';
import { Product, ProductDocument } from 'src/products/schema/products.schema';
@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}
  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartModel
      .findOne({ user: userId })
      .populate('items.product');
    if (!cart) {
      cart = await this.cartModel.create({
        user: new Types.ObjectId(userId),
        items: [],
      });
      await cart.populate('items.product');
    }
    return cart;
  }
  async addToCart(
    userId: string,
    productId: string,
    quantity = 1,
  ): Promise<Cart> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');
    let cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      cart = await this.cartModel.create({
        user: new Types.ObjectId(userId),
        items: [],
      });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: new Types.ObjectId(product._id as string),
        quantity,
      });
    }
    await cart.save();
    await cart.populate('items.product');
    return cart;
  }
  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException('Cart not found');
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );
    await cart.save();
    await cart.populate('items.product');
    return cart;
  }
  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException('Cart not found');
    cart.items = [];
    await cart.save();
    await cart.populate('items.product');
    return cart;
  }
}
