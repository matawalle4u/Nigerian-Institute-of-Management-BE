import { Controller, Post, Get, Param, Patch, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateGeneralNotificationDto } from './dto/create-general-notification.dto';
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('create')
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const { loginId, title, message, type } = createNotificationDto;
    return this.notificationService.createNotification(
      loginId,
      title,
      message,
      type,
    );
  }
  @Post('create/all')
  async createBillForAllUsers(
    @Body() generalNotificationDto: CreateGeneralNotificationDto,
  ) {
    return this.notificationService.createGeneralNotification(
      generalNotificationDto,
    );
  }

  @Get(':loginId')
  async findAll(@Param('loginId') loginId: number) {
    return this.notificationService.getNotificationsByLogin(loginId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: number) {
    return this.notificationService.markAsRead(id);
  }
}
