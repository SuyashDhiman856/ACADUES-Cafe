import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ChefsService {

  constructor(private prisma: PrismaService) {}

  async getMyOrders(chefId: string) {

    return this.prisma.order.findMany({

      where: {
        chefId,
      },

      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

    });

  }

  async updateStatus(
    orderId: string,
    chefId: string,
    status: OrderStatus,
  ) {

    const order =
      await this.prisma.order.findUnique({
        where: { id: orderId },
      });

    if (!order)
      throw new NotFoundException('Order not found');

    if (order.chefId !== chefId)
      throw new NotFoundException(
        'Not your order',
      );

    return this.prisma.order.update({

      where: { id: orderId },

      data: {
        status,
      },

    });

  }

}