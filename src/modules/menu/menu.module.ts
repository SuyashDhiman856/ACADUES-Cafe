import { Module } from '@nestjs/common';
import { MenuService } from './services/menu.service';
import { MenuController } from './controllers/menu.controller';

@Module({
  providers: [MenuService],
  controllers: [MenuController],
  exports: [MenuService],
})
export class MenuModule {}