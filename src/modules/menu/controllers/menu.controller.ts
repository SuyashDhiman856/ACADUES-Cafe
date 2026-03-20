import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { MenuService } from '../services/menu.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { UploadService } from '../../../common/upload/upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('menu')
export class MenuController {

  constructor(
    private menuService: MenuService,
    private uploadService: UploadService,
  ) { }

  @Public()
  @Get()
  async findAll() {

    const menu = await this.menuService.findAll();

    return {
      success: true,
      data: menu,
      message: 'Menu fetched successfully',
    }
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Post('create')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  @UseInterceptors(FileInterceptor('image'))
  async create(

    @UploadedFile() file: Express.Multer.File,

    @Body() body: CreateMenuItemDto,

  ) {

    let imageUrl: string | undefined;

    if (file) {
      imageUrl =
        await this.uploadService
          .uploadMenuImage(file);
    }

    const parsedBody = {

      ...body,

      price: parseFloat(body.price as any),

      hasSizes:
        body.hasSizes === true ||
        (body.hasSizes as any) === 'true' ||
        (body.hasSizes as any) === 'True',

      sizes:
        body.sizes
          ? typeof body.sizes === 'string'
            ? JSON.parse(body.sizes)
            : body.sizes
          : [],
      imageUrl: imageUrl || '',
    };
    return this.menuService.create(parsedBody);
  }

  @Patch('update/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.update(id, dto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  delete(@Param('id') id: string) {
    return this.menuService.delete(id);
  }
}