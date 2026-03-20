import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { TablesService } from '../services/tables.service';

@Controller('tables')
export class TablesController {

  constructor(private tablesService: TablesService) {}

  // Owner creates table QR
  @Post(':tableNumber')
  createTable(
    @Param('tableNumber', ParseIntPipe)
    tableNumber: number,
  ) {

    return this.tablesService.createTable(tableNumber);

  }

  // Get all tables
  @Get()
  getAllTables() {

    return this.tablesService.findAllTables();

  }

  // Get table info (public)
  @Get(':tableId')
  getTable(@Param('tableId') tableId: string) {

    return this.tablesService.findTableById(tableId);

  }

}