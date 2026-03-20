import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';

import { FoodType } from '@prisma/client';

export class CreateMenuItemDto {

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(FoodType)
    foodType: FoodType;

    @IsBoolean()
    hasSizes: boolean;

    @IsNumber()
    price: number;

    @IsString()
    categoryId: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsArray()
    sizes?: {
        name: string;
        price: number;
    }[];

}