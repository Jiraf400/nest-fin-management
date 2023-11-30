import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyLimitsService } from './monthly-limits.service';

describe('MonthlyLimitsService', () => {
  let service: MonthlyLimitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonthlyLimitsService],
    }).compile();

    service = module.get<MonthlyLimitsService>(MonthlyLimitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
