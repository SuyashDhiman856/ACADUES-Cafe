import { Role } from '@prisma/client';

export class CreateStaffDto {

  fullName: string;

  email: string;

  phone: string;

  role: Role;

}