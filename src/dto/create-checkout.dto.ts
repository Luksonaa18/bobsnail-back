export class CreateCheckoutDto {
  user!: {
    name: string;
    email: string;
  };
  cartItems!: {
    _id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total!: number;
}
