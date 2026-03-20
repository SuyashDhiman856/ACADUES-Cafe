// src/modules/categories/categories.service.ts

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService }
from '../../../prisma/prisma.service';

import { CreateCategoryDto }
from '../dto/create-category.dto';

import { UpdateCategoryDto }
from '../dto/update-category.dto';

@Injectable()
export class CategoryService {

  constructor(
    private prisma: PrismaService,
  ) {}

  //////////////////////////////////////////////////////
  // CREATE CATEGORY
  //////////////////////////////////////////////////////

  async create(dto: CreateCategoryDto) {

    const existing =
      await this.prisma.category.findUnique({
        where: {
          name: dto.name,
        },
      });

    if (existing)
      throw new ConflictException(
        'Category already exists',
      );

    return this.prisma.category.create({
      data: {
        name: dto.name,
      },
    });

  }

  //////////////////////////////////////////////////////
  // GET ALL CATEGORIES
  //////////////////////////////////////////////////////

  async findAll() {

    return this.prisma.category.findMany({

      orderBy: {
        name: 'asc',
      },

    });

  }

  //////////////////////////////////////////////////////
  // GET CATEGORY BY ID
  //////////////////////////////////////////////////////

  async findOne(id: string) {

    const category =
      await this.prisma.category.findUnique({
        where: { id },
      });

    if (!category)
      throw new NotFoundException(
        'Category not found',
      );

    return category;

  }

  //////////////////////////////////////////////////////
  // UPDATE CATEGORY
  //////////////////////////////////////////////////////

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ) {

    await this.findOne(id);

    const existing = await this.prisma.category.findFirst({
      where: {
        name: dto.name,
        id: { not: id },
      },
    });

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    return this.prisma.category.update({

      where: { id },

      data: dto,

    });

  }

  //////////////////////////////////////////////////////
  // DELETE CATEGORY
  //////////////////////////////////////////////////////

  async remove(id: string) {

    await this.findOne(id);

    return this.prisma.category.delete({

      where: { id },

    });

  }

}