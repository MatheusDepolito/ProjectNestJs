/* eslint-disable prettier/prettier */
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { JwtService} from '@nestjs/jwt';
import { users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService, private readonly userService: UserService) {}

  createToken(user: users) {
    return {
        acessToken: this.jwtService.sign({
            id: user.id,
            name: user.name,
            email: user.email
        }, {
            expiresIn: '7 days',
            subject: String(user.id),
            issuer: 'api',
            audience: 'users'
        })
    }
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token);
      return data;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (err) {
      return false;
    }
  }


  async login(email: string, password: string) {
    const user = await this.prisma.users.findFirst({
        where: {
            email
        }
    })

    if(!user) {
      throw new UnauthorizedException('Email e/ou senha incorretos');
    }

    if(!bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Email e/ou senha incorretos'); 
    }

    return this.createToken(user);
  }

  async forget(email: string) {
    const user = await this.prisma.users.findFirst({
        where: {
            email
        }
    })

    if(!user) {
        throw new UnauthorizedException('Email incorreto');
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async reset(password: string, token: string) {

    const id = 0;

    const user = await this.prisma.users.update({
        where: {
            id,
        },
        data: {
            password,
        },
    });
    return this.createToken(user);
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.userService.create(data);

    return this.createToken(user);
  }
}