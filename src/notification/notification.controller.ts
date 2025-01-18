import { Controller, Get, Param, Post, Body, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(
    @Body('recipientId') recipientId: string,
    @Body('message') message: string,
  ): Promise<{ message: string }> {
    await this.notificationService.sendNotification(recipientId, message);
    return { message: 'Notification sent successfully' };
  }

  @Get(':userId')
  async getNotifications(@Param('userId') userId: string): Promise<any[]> {
    return await this.notificationService.getNotificationsForUser(userId);
  }
}
