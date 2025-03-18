import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Login } from 'src/account/entities/login.entity';
import { FirebaseService } from './firebase.service';
@Module({
  imports: [TypeOrmModule.forFeature([Notification, Login])],
  controllers: [NotificationController],
  providers: [NotificationService, FirebaseService],
  exports: [NotificationService],
})
export class NotificationModule {}
