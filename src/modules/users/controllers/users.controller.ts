import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';

@Controller('users')
@UseGuards(JwtGuard, RolesGuard)
export class UsersController {

  constructor(private usersService: UsersService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get('role/chefs')
  async getChefs() {
    return this.usersService.findChefs();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get('role/owners')
  async getOwners() {
    return this.usersService.findOwners();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get('role/customers')
  async getCustomers() {
    return this.usersService.findCustomers();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}