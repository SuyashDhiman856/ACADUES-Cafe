import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import type { RoleType } from '../../../common/enums/role.enum';

export class RegisterDto {

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: RoleType;
}