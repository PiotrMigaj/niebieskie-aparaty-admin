import { PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../../config/db';
import bcrypt from 'bcrypt';

const TABLE_NAME = 'Users';
const SALT_ROUNDS = 10;

interface UserDto {
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
  active: boolean;
}

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class User {
  private createdAt: Date;
  private role: UserRole;
  private active: boolean;

  constructor(
    private username: string,
    private email: string,
    private fullName: string,
    private password: string,
  ) {
    this.username = username;
    this.createdAt = new Date();
    this.email = email;
    this.fullName = fullName;
    this.password = password;
    this.role = UserRole.USER;
    this.active = true;
  }

  async save(): Promise<User> {
    await this.hashPassword();
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        username: this.username,
        createdAt: this.createdAt.toISOString(),
        email: this.email,
        fullName: this.fullName,
        password: this.password,
        role: this.role,
        active: this.active,
      },
    });
    await dynamoDb.send(command);
    return this;
  }

  static async existsByUsername(username: string): Promise<boolean> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        username: username,
      },
    });
    const { Item } = await dynamoDb.send(command);
    return !!Item;
  }

  static async findAll(): Promise<User[]> {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });
    const { Items } = await dynamoDb.send(command);
    return (Items ?? []).map((item) => {
      const user = new User(item.username, item.email, item.fullName, item.password);
      user.createdAt = new Date(item.createdAt);
      user.role = item.role;
      user.active = item.active;
      return user;
    });
  }

  toResponse(): UserDto {
    return {
      username: this.username,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
      createdAt: this.createdAt,
      active: this.active,
    };
  }

  private async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
}
