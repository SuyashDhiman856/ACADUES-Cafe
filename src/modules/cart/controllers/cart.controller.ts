import {
  Controller,
  Post,
  Get,
  Body,
  Param,
} from '@nestjs/common';

import { CartService } from '../services/cart.service';

@Controller('cart')
export class CartController {

  constructor(private cartService: CartService) {}

  @Post()
  addToCart(@Body() dto) {

    return this.cartService.addToCart(dto);

  }

  @Get(':tableId')
  getCart(@Param('tableId') tableId: string) {

    return this.cartService.getCart(tableId);

  }

   @Post(':tableId/send-to-kitchen')
  sendToKitchen(
    @Param('tableId') tableId: string,
    @Body('orderType') orderType: 'DINE_IN' | 'TAKEAWAY',
  ) {

    return this.cartService.sendToKitchen(
      tableId,
      orderType,
    );

  }


}