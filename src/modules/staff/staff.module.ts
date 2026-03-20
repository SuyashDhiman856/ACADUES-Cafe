import { Module } from '@nestjs/common';
import { StaffController } from './controllers/staff.controller';
import { StaffService } from './services/staff.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
