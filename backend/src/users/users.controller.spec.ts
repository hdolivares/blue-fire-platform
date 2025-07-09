import { Test, TestingModule } from '@nestjs/testing';
import { InvestorsController } from './users.controller';

describe('InvestorsController', () => {
  let controller: InvestorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestorsController],
    }).compile();

    controller = module.get<InvestorsController>(InvestorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
