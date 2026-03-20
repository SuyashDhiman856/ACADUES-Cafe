import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

import * as QRCode from 'qrcode';

@Injectable()
export class TablesService {

  constructor(private prisma: PrismaService) {}

  async createTable(tableNumber: number) {

    const table = await this.prisma.table.create({
      data: {
        tableNumber,
        qrCodeUrl: '',
      },
    });

    const menuUrl =
      `${process.env.FRONTEND_URL}/menu?tableId=${table.id}`;

    const qrCode = await QRCode.toDataURL(menuUrl);

    const updatedTable = await this.prisma.table.update({
      where: { id: table.id },
      data: {
        qrCodeUrl: qrCode,
      },
    });

    return {
      message: 'Table created successfully',
      tableId: updatedTable.id,
      tableNumber: updatedTable.tableNumber,
      qrCode: updatedTable.qrCodeUrl,
      menuUrl,
    };

  }

  async findAllTables() {

    return this.prisma.table.findMany({
      orderBy: {
        tableNumber: 'asc',
      },
    });

  }

  async findTableById(tableId: string) {

    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table)
      throw new NotFoundException('Table not found');

    return table;

  }

}