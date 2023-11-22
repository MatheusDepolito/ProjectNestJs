import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    data.password = data.password;

    const salt = await bcrypt.genSalt();

    data.password = await bcrypt.hash(data.password, salt);

    return await this.prisma.users.create({
      data,
    });
  }

  async list() {
    return await this.prisma.users.findMany();
  }

  async show(id: number) {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    await this.exists(id);

    const salt = await bcrypt.genSalt();

    data.password = await bcrypt.hash(data.password, salt);

    return this.prisma.users.update({
      data,
      where: { id },
    });
  }
  async delete(id: number) {
    await this.exists(id);

    return this.prisma.users.delete({
      where: { id },
    });
  }

  async exists(id: number) {
    if (!(await this.show(id))) {
      throw new NotFoundException('O user não existe.');
    }
  }
}
