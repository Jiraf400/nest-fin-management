import { Prisma } from '@prisma/client';

export class User implements Prisma.UserCreateInput {
  constructor(email: string, name: string, password: string) {
    this.email = email;
    this.name = name;
    this.password = password;
  }

  email: string;
  name: string;
  password: string;
}
