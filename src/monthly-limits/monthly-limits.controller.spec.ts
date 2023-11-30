import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyLimitsController } from './monthly-limits.controller';

describe('MonthlyLimitsController', () => {
  let controller: MonthlyLimitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonthlyLimitsController],
    }).compile();

    controller = module.get<MonthlyLimitsController>(MonthlyLimitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
