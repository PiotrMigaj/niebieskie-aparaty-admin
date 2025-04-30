import { UserDto } from './User';

export interface UserFacade {
  generatePassword(length: number): string;
  createUser(username: string, email: string, fullName: string, password: string): Promise<UserDto>;
  getAllUsers(): Promise<UserDto[]>;
  getUserByUsername(username: string): Promise<UserDto | null>;
  deleteUser(username: string): Promise<void>;
}
