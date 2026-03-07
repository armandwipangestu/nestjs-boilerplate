import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { AppConfigService } from '../config/app-config.service';
import { MetricsService } from '../common/observability/metrics.service';
import { CustomLoggerService } from '../common/logger/logger.service';

const mockAppConfig = {
  databaseUrl: 'postgresql://test:test@localhost:5432/test',
  dbSlowQueryThreshold: 200,
};

const mockMetricsService = {
  dbQueryTotal: {
    add: jest.fn(),
  },
  dbQueryDuration: {
    record: jest.fn(),
  },
  dbQueryErrorsTotal: {
    add: jest.fn(),
  },
  dbSlowQueryTotal: {
    add: jest.fn(),
  },
};

const mockLoggerService = {
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  trace: jest.fn(),
};

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        { provide: AppConfigService, useValue: mockAppConfig },
        { provide: MetricsService, useValue: mockMetricsService },
        { provide: CustomLoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
