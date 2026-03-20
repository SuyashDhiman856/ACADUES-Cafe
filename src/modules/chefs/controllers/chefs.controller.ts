import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ChefsService } from '../services/chefs.service';
import { OrdersService } from '../../orders/services/orders.service';

import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';

@Controller('chef')
export class ChefsController {

  constructor(
    private chefService: ChefsService,
    private ordersService: OrdersService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get(':chefId')
  getChefOrders(
    @Param('chefId') chefId: string,
  ) {

    return this.ordersService.getChefOrders(chefId);

  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.CHEF)
  @Get('orders')
  getMyOrders(@Req() req) {

    return this.ordersService.getChefOrders(
      req.user.id,
    );

  }

  @Patch('orders/:orderId/status')
  updateStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: OrderStatus,
    @Req() req,
  ) {

    return this.chefService.updateStatus(
      orderId,
      req.user.id,
      status,
    );

  }

}