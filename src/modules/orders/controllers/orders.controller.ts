import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';

import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('orders')
export class OrdersController {

  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Post('table/:tableId')
  async createOrderForTable(
    @Param('tableId') tableId: string,
    @Body() dto: CreateOrderDto,
    @Req() req: any,
  ) {

    // Get customerId from JWT token payload
    const customerId = req.user?.id;

    if (!customerId) {
      throw new BadRequestException('User not authenticated');
    }

    // Ensure tableId matches
    const fullDto = {
      ...dto,
      tableId,
    };

    return this.ordersService.createOrder(
      fullDto,
      customerId,
    );

  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.CHEF)
  @Get('my-orders')
  getMyOrders(@Req() req) {
    return this.ordersService.getChefOrders(
      req.user.id,
    );
  }

  // @UseGuards(JwtGuard, RolesGuard)
  // @Roles(Role.OWNER)
  @Public()
  @Get()
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get('table/:tableId')
  getOrdersByTable(
    @Param('tableId') tableId: string,
  ) {

    return this.ordersService.getOrdersByTable(
      tableId,
    );

  }

  @Get(':orderId/chef')
  getOrderChef(
    @Param('orderId') orderId: string,
  ) {

    return this.ordersService.getOrderChef(
      orderId,
    );

  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.CHEF, Role.OWNER)
  @Patch(':orderId/status')
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req,
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      dto.status,
      req.user.id,
      req.user.role,
    );
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Patch(':orderId/assign-chef/:chefId')
  assignChef(
    @Param('orderId') orderId: string,
    @Param('chefId') chefId: string,
  ) {

    return this.ordersService.assignChef(
      orderId,
      chefId,
    );

  }

}