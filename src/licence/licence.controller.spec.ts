import { Test, TestingModule } from '@nestjs/testing';
import { LicenceController } from './licence.controller';

describe('LicenceController', () => {
  let controller: LicenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicenceController],
    }).compile();

    controller = module.get<LicenceController>(LicenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
