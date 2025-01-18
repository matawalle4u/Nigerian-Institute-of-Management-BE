import { Controller, Post, Get, Param, Patch, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateGeneralNotificationDto } from './dto/create-general-notification.dto';
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Create a notification
  @Post('create')
  async create(createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }
  @Post('create/all')
  async createBillForAllUsers(
    @Body() generalNotificationDto: CreateGeneralNotificationDto,
  ) {
    return this.notificationService.createGeneralNotification(
      generalNotificationDto,
    );
  }

  // Get all notifications for a login
  @Get(':loginId')
  async findAll(@Param('loginId') loginId: number) {
    return this.notificationService.getNotificationsByLogin(loginId);
  }

  // Mark a notification as read
  @Patch(':id/read')
  async markAsRead(@Param('id') id: number) {
    return this.notificationService.markAsRead(id);
  }
}
