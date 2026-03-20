import { Injectable } from '@nestjs/common';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) { }
  async create(dto: CreateStaffDto) {

    return this.prisma.staffMember.create({

      data: dto,

    });

  }

  async findAll() {

    return this.prisma.staffMember.findMany();

  }
}
