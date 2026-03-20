// src/modules/categories/categories.module.ts

import { Module }
from '@nestjs/common';

import { CategoryService }
from './services/category.service';

import { CategoryController }
from './controllers/category.controller';

import { PrismaModule }
from '../../prisma/prisma.module';

@Module({

  imports: [
    PrismaModule,
  ],

  providers: [
    CategoryService,
  ],

  controllers: [
    CategoryController,
  ],

  exports: [
    CategoryService,
  ],

})
export class CategoryModule {}