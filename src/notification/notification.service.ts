import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateGeneralNotificationDto } from './dto/create-general-notification.dto';
import { Login } from 'src/account/entities/login.entity';
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Login)
    private readonly userRepository: Repository<Login>,
  ) {}

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const { loginId, title, message } = createNotificationDto;
    const notification = this.notificationRepository.create({
      user: { id: loginId },
      title,
      message,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async createGeneralNotification(
    createGeneralNotificationDto: CreateGeneralNotificationDto,
  ) {
    const users = await this.userRepository.find();
    if (!users.length) {
      throw new BadRequestException('No users found');
    }
    const notifications = users.map((user) =>
      this.notificationRepository.create({
        user,
        title: createGeneralNotificationDto.title,
        message: createGeneralNotificationDto.message,
      }),
    );

    return this.notificationRepository.save(notifications);
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
