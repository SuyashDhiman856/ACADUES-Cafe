import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(dto) {

    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword
    });

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return {
      message: `${user.role} registration successful`,
      accessToken: token,
      user: userWithoutPassword,
    }
  }

  async login(dto) {

    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return {
      message: `${user.role} logged in successfully`,
      accessToken: token,
      user: userWithoutPassword,
    };
  }

  generateToken(user) {

    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}