import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CartService {

  constructor(private prisma: PrismaService) {}

  async addToCart(dto) {

    let cart =
      await this.prisma.cart.findFirst({
        where: {
          tableId: dto.tableId,
        },
      });

    if (!cart) {

      cart =
        await this.prisma.cart.create({
          data: {
            tableId: dto.tableId,
          },
        });

    }

    return this.prisma.cartItem.create({

      data: {

        cartId: cart.id,

        menuItemId: dto.menuItemId,

        quantity: dto.quantity,

      },

    });

  }

  async getCart(tableId: string) {

    return this.prisma.cart.findFirst({

      where: {
        tableId,
      },

      include: {
        cartItems: {
          include: {
            menuItem: true,
          },
        },
      },

    });

  }

  async clearCart(tableId: string) {

    const cart =
      await this.prisma.cart.findFirst({
        where: { tableId },
      });

    if (!cart) return;

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

  }

  async sendToKitchen(
    tableId: string,
    orderType: 'DINE_IN' | 'TAKEAWAY',
  ) {

    const cart =
      await this.prisma.cart.findFirst({

        where: { tableId },

        include: {

          cartItems: {
            include: {
              menuItem: true,
            },
          },

        },

      });

    if (!cart)
      throw new NotFoundException(
        'Cart not found',
      );

    if (cart.cartItems.length === 0)
      throw new NotFoundException(
        'Cart is empty',
      );

    let subtotal = 0;

    const orderItems = cart.cartItems.map(item => {

      const price = item.menuItem.price || 0;

      const total =
        price * item.quantity;

      subtotal += total;

      return {

        menuItemId: item.menuItemId,

        quantity: item.quantity,

        price,

        total,

      };

    });

    const gstRate = 18;

    const totalAmount =
      subtotal + (subtotal * gstRate) / 100;

    const order =
      await this.prisma.order.create({

        data: {

          tableId,

          orderType,

          subtotal,

          gstRate,

          totalAmount,

          orderItems: {
            create: orderItems,
          },

        },

        include: {
          orderItems: true,
        },

      });

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return {

      message: 'Order sent to kitchen',

      order,

    };

  }

}