import { Module } from '@nestjs/common';

import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { OrdersGateway } from './gateway/orders.gateway';

@Module({

  providers: [OrdersService, OrdersGateway],

  controllers: [OrdersController],

  exports: [OrdersService, OrdersGateway],

})
export class OrdersModule {}