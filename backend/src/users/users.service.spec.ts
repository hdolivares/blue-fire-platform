import { Test, TestingModule } from '@nestjs/testing';
import { InvestorsService } from './users.service';

describe('InvestorsService', () => {
  let service: InvestorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestorsService],
    }).compile();

    service = module.get<InvestorsService>(InvestorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
