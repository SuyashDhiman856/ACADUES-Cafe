// src/modules/categories/categories.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { CategoryService }
from '../services/category.service';

import { CreateCategoryDto }
from '../dto/create-category.dto';

import { UpdateCategoryDto }
from '../dto/update-category.dto';

import { JwtGuard }
from '../../../common/guards/jwt.guard';

import { RolesGuard }
from '../../../common/guards/roles.guard';

import { Roles }
from '../../../common/decorators/roles.decorator';

import { Role }
from '@prisma/client';

@Controller('categories')
export class CategoryController {

  constructor(
    private categoriesService: CategoryService,
  ) {}

  //////////////////////////////////////////////////////
  // CREATE CATEGORY (OWNER ONLY)
  //////////////////////////////////////////////////////

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post()
  create(
    @Body() dto: CreateCategoryDto,
  ) {

    return this.categoriesService.create(dto);

  }

  //////////////////////////////////////////////////////
  // GET ALL CATEGORIES (PUBLIC)
  //////////////////////////////////////////////////////

  @Get()
  findAll() {

    return this.categoriesService.findAll();

  }

  //////////////////////////////////////////////////////
  // GET CATEGORY BY ID
  //////////////////////////////////////////////////////

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {

    return this.categoriesService.findOne(id);

  }

  //////////////////////////////////////////////////////
  // UPDATE CATEGORY (OWNER ONLY)
  //////////////////////////////////////////////////////

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {

    return this.categoriesService.update(
      id,
      dto,
    );

  }

  //////////////////////////////////////////////////////
  // DELETE CATEGORY (OWNER ONLY)
  //////////////////////////////////////////////////////

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {

    return this.categoriesService.remove(id);

  }

}