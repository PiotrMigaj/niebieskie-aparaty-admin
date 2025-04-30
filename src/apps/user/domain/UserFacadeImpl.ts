import { injectable } from 'tsyringe';
import crypto from 'crypto';
import { User, UserDto } from './User';
import { UserFacade } from './UserFacade';
import { createAppError } from '../../../middleware/errorMiddleware';

@injectable()
export class UserFacadeImpl implements UserFacade {
  generatePassword(length: number): string {
    const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const randomValues = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      password += charSet[randomValues[i] % charSet.length];
    }

    return password;
  }

  async createUser(
    username: string,
    email: string,
    fullName: string,
    password: string,
  ): Promise<UserDto> {
    const usernameExists = await User.existsByUsername(username);
    if (usernameExists) {
      throw createAppError(409, 'User with such username already exists');
    }
    const user = new User(username, email, fullName, password);
    const savedUser = await user.save();
    return savedUser.toResponse();
  }

  async getAllUsers(): Promise<UserDto[]> {
    const users = await User.findAll();
    return users.map((user) => user.toResponse());
  }
}
