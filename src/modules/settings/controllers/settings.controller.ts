import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from "@nestjs/common";

import { SettingsService } from "../services/settings.service";
import { JwtGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";
import { Public } from "src/common/decorators/public.decorator";

@Controller("settings")
export class SettingsController {

  constructor(private settingsService: SettingsService) {}

  // GET /settings
  @Public()
  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  // PATCH /settings
  @Patch()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.OWNER)
  updateSettings(@Body() body: any) {
    return this.settingsService.updateSettings(body);
  }

}