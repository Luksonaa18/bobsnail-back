import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
  ) {}
 async register(registerDto: RegisterDto) {
  const { name, email, password, role } = registerDto;
  const existing = await this.UserModel.findOne({ email });
  if (existing)
    throw new BadRequestException('User with this email already exists');

  const hashed = await bcrypt.hash(password, 10);
  const user = await this.UserModel.create({ name, email, password: hashed, role });

  const token = this.jwtService.sign({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

async login(loginDto: LoginDto) {
  const { email, password } = loginDto;
  const user = await this.UserModel.findOne({ email }).select('+password');

  if (!user) throw new UnauthorizedException('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new UnauthorizedException('Invalid credentials');

  const token = this.jwtService.sign({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}
}
