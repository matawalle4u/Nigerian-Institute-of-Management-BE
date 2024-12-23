import { Module } from '@nestjs/common';
import { LicenceService } from './licence.service';
import { LicenceController } from './licence.controller';

@Module({
  providers: [LicenceService],
  controllers: [LicenceController]
})
export class LicenceModule {}
