const path = require('path');

let isIntegrationTest = false;

beforeEach(() => {
  isIntegrationTest =
    process.env.TEST_ENV === 'integration' ||
    (process.env.npm_config_reporter || '').includes('integration') ||
    expect.getState().currentTestName?.includes('Integration');
});

jest.mock(
  '../../prisma/generated/prisma/client',
  () => {
    if (isIntegrationTest) {
      const originalModule = jest.requireActual(
        '../../prisma/generated/prisma/client',
      );
      return originalModule;
    }

    const mockClient = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        upsert: jest.fn(),
      },
      productionData: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        upsert: jest.fn(),
        count: jest.fn(),
      },
      expenditure: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        upsert: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    return {
      PrismaClient: jest.fn(() => mockClient),
      __esModule: true,
    };
  },
  { virtual: true },
);
