import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Login } from './entities/login.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Login])],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
