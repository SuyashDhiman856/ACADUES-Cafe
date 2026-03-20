import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderStatus } from '@prisma/client';
import { OrdersGateway } from '../gateway/orders.gateway';

@Injectable()
export class OrdersService {

    constructor(
        private readonly prisma: PrismaService,
        private ordersGateway: OrdersGateway,
    ) { }

    async createOrder(
        dto: CreateOrderDto,
        customerId: string,
    ) {

        const table = await this.prisma.table.findUnique({
            where: { id: dto.tableId },
        });

        if (!table)
            throw new NotFoundException('Table not found');

        const customer = await this.prisma.user.findUnique({
            where: { id: customerId },
        });

        if (!customer)
            throw new NotFoundException('Customer not found');

        // Get all available chefs
        const allChefs = await this.prisma.user.findMany({
            where: { role: 'CHEF' },
        });

        if (!allChefs || allChefs.length === 0)
            throw new NotFoundException('No chef available');

        // Find chef with least active orders
        let chefWithLeastOrders = allChefs[0];
        let minActiveOrders = await this.countActiveOrders(allChefs[0].id);

        for (let i = 1; i < allChefs.length; i++) {
            const activeOrders = await this.countActiveOrders(allChefs[i].id);
            if (activeOrders < minActiveOrders) {
                minActiveOrders = activeOrders;
                chefWithLeastOrders = allChefs[i];
            }
        }

        const chef = chefWithLeastOrders;

        let subtotal = 0;

        const orderItems: {
            menuItemId: string;
            quantity: number;
            price: number;
            total: number;
        }[] = [];

        for (const item of dto.items) {

            const menuItem =
                await this.prisma.menuItem.findUnique({
                    where: { id: item.menuItemId },
                    include: { sizes: true },
                });

            if (!menuItem)
                throw new NotFoundException(
                    `Menu item ${item.menuItemId} not found`,
                );

            let price = menuItem.price || 0;

            if (item.sizeId) {

                const size = menuItem.sizes.find(
                    s => s.id === item.sizeId,
                );

                if (!size)
                    throw new NotFoundException(
                        `Size not found`,
                    );

                price = size.price;

            }

            const total = price * item.quantity;

            subtotal += total;

            orderItems.push({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price,
                total,
            });

        }

        const gstRate = 18;

        const totalAmount =
            subtotal + (subtotal * gstRate) / 100;

        const order = await this.prisma.order.create({
            data: {

                tableId: dto.tableId,

                customerId: customerId,

                chefId: chef.id,

                status: 'PREPARING',

                orderType: dto.orderType,

                subtotal,

                gstRate,

                totalAmount,

                orderItems: {
                    create: orderItems,
                },

            },

            include: {
                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },
                table: true,
            },
        });

        this.ordersGateway.emitNewOrder(order);

        return order;
    }

    async getOrdersByTable(tableId: string) {

        return this.prisma.order.findMany({

            where: { tableId },

            include: {
                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },
                table: true,
            },

            orderBy: {
                createdAt: 'desc',
            },

        });

    }

    async getAllOrders() {

        return this.prisma.order.findMany({

            include: {

                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },

                table: true,

                chef: true,

            },

            orderBy: {
                createdAt: 'desc',
            },

        });

    }

    async getChefOrders(chefId: string) {

        return this.prisma.order.findMany({

            where: {
                chefId,
            },

            include: {

                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },

                table: true,

            },

            orderBy: {
                createdAt: 'desc',
            },

        });

    }

    async getOrderChef(orderId: string) {

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { chef: true },
        });

        if (!order)
            throw new NotFoundException('Order not found');

        if (!order.chefId || !order.chef)
            throw new NotFoundException('No chef assigned to this order');

        return order.chef;

    }

    async updateOrderStatus(
        orderId: string,
        status: string,
        userId: string,
        userRole: string,
    ) {

        const order =
            await this.prisma.order.findUnique({
                where: { id: orderId },
            });

        if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
            throw new Error('Invalid order status');
        }

        if (!order)
            throw new NotFoundException(
                'Order not found',
            );

        // Chef can only update their own orders, Owner can update any order
        if (userRole === 'CHEF' && order.chefId !== userId)
            throw new BadRequestException(
                'Not your assigned order',
            );

        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },

            data: {
                status: status as OrderStatus,
            },
        });

        this.ordersGateway.emitOrderUpdate(
            updatedOrder,
        );

        return updatedOrder;
    }

    async assignChef(
        orderId: string,
        chefId: string,
    ) {

        const order =
            await this.prisma.order.findUnique({
                where: { id: orderId },
            });

        if (!order)
            throw new NotFoundException(
                'Order not found',
            );

        const chef =
            await this.prisma.user.findUnique({
                where: { id: chefId },
            });

        if (!chef)
            throw new NotFoundException(
                'Chef not found',
            );

        return this.prisma.order.update({

            where: { id: orderId },

            data: {
                chefId,
                status: 'PREPARING',
            },

        });

    }

    private async countActiveOrders(chefId: string): Promise<number> {
        return this.prisma.order.count({
            where: {
                chefId,
                status: {
                    in: ['CREATED', 'SENT_TO_KITCHEN', 'PREPARING'],
                },
            },
        });
    }

}