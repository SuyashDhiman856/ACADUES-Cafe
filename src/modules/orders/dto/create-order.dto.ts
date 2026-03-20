import { IsString, IsEnum, IsArray, IsNumber, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '@prisma/client';

class OrderItemDto {
  @IsString()
  menuItemId: string;

  @IsOptional()
  @IsString()
  sizeId?: string;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {

  @IsString()
  tableId: string;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

}