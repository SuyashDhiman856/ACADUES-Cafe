import { Controller } from '@nestjs/common';
import { Body, Get, Post, UseGuards } from '@nestjs/common';
import { StaffService } from '../services/staff.service';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { JwtGuard } from './../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';

@Controller('staff')
export class StaffController {
  constructor(private staffService: StaffService) { }
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post()
  create(@Body() dto: CreateStaffDto) {

    return this.staffService.create(dto);

  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get()
  findAll() {

    return this.staffService.findAll();

  }
}
