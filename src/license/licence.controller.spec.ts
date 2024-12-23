import { Test, TestingModule } from '@nestjs/testing';
import { LicenseController } from './licence.controller';

describe('LicenceController', () => {
  let controller: LicenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicenseController],
    }).compile();

    controller = module.get<LicenseController>(LicenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
