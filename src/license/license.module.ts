import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './licence.controller';
import { License } from './entities/license.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { Login } from 'src/account/entities/login.entity';

@Module({
  imports: [TypeOrmModule.forFeature([License, Login]), AccountModule],
  providers: [LicenseService],
  controllers: [LicenseController],
})
export class LicenseModule {}
