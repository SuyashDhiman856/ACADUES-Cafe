import { Module } from '@nestjs/common';
import { ChefsController } from './controllers/chefs.controller';
import { ChefsService } from './services/chefs.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [ChefsController],
  providers: [ChefsService],
  exports: [ChefsService],
})
export class ChefsModule {}