// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleType } from '../enums/role.enum';

export const Roles = (...roles: RoleType[]) =>
  SetMetadata('roles', roles);