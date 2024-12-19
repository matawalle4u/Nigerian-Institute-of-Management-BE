import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Login } from './entities/login.entity';
import { JwtModule } from '@nestjs/jwt';
import { Members } from 'src/membership/entities/membership.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Login, Members]),
    JwtModule.register({
      secret: 'Yan2Mak!!',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
