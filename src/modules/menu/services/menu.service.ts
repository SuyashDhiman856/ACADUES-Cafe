import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';

@Injectable()
export class MenuService {

    constructor(private prisma: PrismaService) { }

    async create(dto: CreateMenuItemDto & { imageUrl: string }) {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const data: any = {
            name: dto.name,

            description: dto.description,

            imageUrl: dto.imageUrl,

            foodType: dto.foodType,

            hasSizes: dto.hasSizes,

            categoryId: dto.categoryId,
        };

        if (!dto.hasSizes) {
            data.price = dto.price;
        }

        if (dto.hasSizes) {
            data.sizes = {
                create: dto.sizes?.map(size => ({
                    name: size.name,
                    price: size.price,
                })),
            };
        }

        return this.prisma.menuItem.create({
            data,

            include: {
                sizes: true,
                category: true,
            },
        });
    }

    findAll() {
        return this.prisma.menuItem.findMany({
            where: {
                isAvailable: true,
            },
            include: {
                category: true,
            },
        });
    }

    findOne(id: string) {
        return this.prisma.menuItem.findUnique({
            where: { id },
            include: { category: true },
        });
    }

    async update(id: string, dto) {
        dto = dto || {};

        if (dto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId },
            });

            if (!category) {
                throw new NotFoundException('Category not found');
            }
        }

        const updatedItem = await this.prisma.menuItem.update({
            where: { id },
            data: dto,
        });

        return {
            message: 'Menu Item Updated',
            data: updatedItem,
        };
    }

    async delete(id: string) {
        const deletedItem = await this.prisma.menuItem.update({
            where: { id },
            data: {
                isAvailable: false,
            },
        });

        return {
            message: 'Menu Item Deleted',
            data: deletedItem,
        };
    }

}