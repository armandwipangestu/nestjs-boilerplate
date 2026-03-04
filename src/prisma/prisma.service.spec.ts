import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { AppConfigService } from '../config/app-config.service';
import { MetricsService } from '../common/observability/metrics.service';

const mockAppConfig = {
  databaseUrl: 'postgresql://test:test@localhost:5432/test',
};

const mockMetricsService = {
  dbQueryTotal: {
    add: jest.fn(),
  },
  recordDbQuery: jest.fn(),
};

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        { provide: AppConfigService, useValue: mockAppConfig },
        { provide: MetricsService, useValue: mockMetricsService },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
