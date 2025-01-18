import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    loginId: number,
    title: string,
    message: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user: { id: loginId },
      title,
      message,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async getNotificationsByLogin(loginId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: loginId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOneBy({
      id: notificationId,
    });
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }
}
