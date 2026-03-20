import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  async create(data) {
    return this.prisma.user.create({
      data
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findChefs() {
    return this.prisma.user.findMany({
      where: { role: 'CHEF' },
    });
  }

  async findOwners() {
    return this.prisma.user.findMany({
      where: { role: 'OWNER' },
    });
  }

  async findCustomers() {
    return this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
    });
  }

}