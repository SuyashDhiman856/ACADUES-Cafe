// src/modules/categories/dto/update-category.dto.ts

import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class UpdateCategoryDto {

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

}