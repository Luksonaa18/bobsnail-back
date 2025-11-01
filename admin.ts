import { connect, model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserSchema } from './src/auth/schema/user.schema';

async function createAdmin() {
  await connect('mongodb://localhost:27017/eccomerce');

  const UserModel = model('User', UserSchema);

  const hashed = await bcrypt.hash('admin123', 10);

  await UserModel.create({
    name: 'Admin User',
    email: 'admin123@gmail.com',
    password: hashed,
    role: 'admin',
  });

  console.log('Admin created!');
}

createAdmin();
