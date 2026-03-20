import { Module } from '@nestjs/common';
import {APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { ChefsModule } from './modules/chefs/chefs.module';
import { TablesModule } from './modules/tables/tables.module';
import { SettingsModule } from './modules/settings/settings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QrModule } from './modules/qr/qr.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtGuard } from './common/guards/jwt.guard';
import { MenuController } from './modules/menu/controllers/menu.controller';
import { UploadModule } from './common/upload/upload.module';
import { ChefsController } from './modules/chefs/controllers/chefs.controller';
import { CategoryModule } from './modules/category/category.module';
import { StaffModule } from './modules/staff/staff.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigService available everywhere
    }),
    PrismaModule, AuthModule, UsersModule, MenuModule, OrdersModule, CartModule, ChefsModule, TablesModule, SettingsModule, NotificationsModule, QrModule, UploadModule, CategoryModule, StaffModule],
  controllers: [AppController, MenuController, ChefsController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    AppService,
  ],
})
export class AppModule {}
