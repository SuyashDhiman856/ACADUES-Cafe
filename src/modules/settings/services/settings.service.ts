import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../../prisma/prisma.service";

import { UpdateSettingsDto } from "../dto/update-settings.dto";

@Injectable()
export class SettingsService {

  constructor(
    private readonly prisma: PrismaService
  ) {}

  //////////////////////////////////////////////////////
  // GET SETTINGS
  //////////////////////////////////////////////////////

  async getSettings() {

    let settings =
      await this.prisma.settings.findFirst();

    // Bootstrap settings if not exists
    if (!settings) {

      settings =
        await this.prisma.settings.create({

          data: {

            restaurantName: "Acadues Cafe",

            contactPhone: "",

            contactEmail: "",

            physicalAddress: "",

            geoLatitude: 0,

            geoLongitude: 0,

            logoUrl: "",

            themeColor: "#000000",

            currency: "INR",

            upiId: "",

            gstNumber: "",

            gstPercentage: 18,

            totalTables: 0,

            enableWhatsappNotifications: true,

            enableChefAutoAssign: false,

            enableAutoAcceptOrders: false,

            maintenanceMode: false,

          },

        });

    }

    return settings;

  }

  //////////////////////////////////////////////////////
  // UPDATE SETTINGS
  //////////////////////////////////////////////////////

  async updateSettings(
    dto: UpdateSettingsDto
  ) {

    const existing =
      await this.prisma.settings.findFirst();

    if (!existing)
      throw new NotFoundException(
        "Settings not found"
      );

    const updated =
      await this.prisma.settings.update({

        where: {
          id: existing.id,
        },

        data: {

          restaurantName:
            dto.restaurantName ?? existing.restaurantName,

          contactPhone:
            dto.contactPhone ?? existing.contactPhone,

          contactEmail:
            dto.contactEmail ?? existing.contactEmail,

          physicalAddress:
            dto.physicalAddress ?? existing.physicalAddress,

          geoLatitude:
            dto.geoLatitude ?? existing.geoLatitude,

          geoLongitude:
            dto.geoLongitude ?? existing.geoLongitude,

          logoUrl:
            dto.logoUrl ?? existing.logoUrl,

          themeColor:
            dto.themeColor ?? existing.themeColor,

          currency:
            dto.currency ?? existing.currency,

          upiId:
            dto.upiId ?? existing.upiId,

          gstNumber:
            dto.gstNumber ?? existing.gstNumber,

          gstPercentage:
            dto.gstPercentage ?? existing.gstPercentage,

          totalTables:
            dto.totalTables ?? existing.totalTables,

          enableWhatsappNotifications:
            dto.enableWhatsappNotifications
              ?? existing.enableWhatsappNotifications,

          enableChefAutoAssign:
            dto.enableChefAutoAssign
              ?? existing.enableChefAutoAssign,

          enableAutoAcceptOrders:
            dto.enableAutoAcceptOrders
              ?? existing.enableAutoAcceptOrders,

          maintenanceMode:
            dto.maintenanceMode
              ?? existing.maintenanceMode,

        },

      });

    return updated;

  }

}