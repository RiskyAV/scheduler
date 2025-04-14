import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { BaseRepository } from './base.repository';

// Create a mock entity for testing
class MockEntity {
  id: string;
  name: string;

  static build = jest.fn();
  static create = jest.fn();
  static upsert = jest.fn();
  static findOne = jest.fn();
  static update = jest.fn();
  static findAll = jest.fn();
  static findAndCountAll = jest.fn();
  static bulkCreate = jest.fn();
  static count = jest.fn();
  static destroy = jest.fn();
}

describe('BaseRepository', () => {
  let repository: BaseRepository<MockEntity>;
  let sequelize: jest.Mocked<Sequelize>;
  let transaction: jest.Mocked<Transaction>;

  beforeEach(() => {
    // Create mock transaction
    transaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    } as unknown as jest.Mocked<Transaction>;

    // Create mock sequelize
    sequelize = {
      transaction: jest.fn().mockResolvedValue(transaction),
      query: jest.fn(),
    } as unknown as jest.Mocked<Sequelize>;

    // Create repository instance
    repository = new BaseRepository<MockEntity>(sequelize, MockEntity, MockEntity);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('startTransaction', () => {
    it('should start a transaction', async () => {
      const result = await repository.startTransaction();

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(result).toBe(transaction);
    });
  });

  describe('build', () => {
    it('should build a model instance', async () => {
      const mockData = { name: 'Test' };
      const mockOptions = { transaction };
      const mockResult = { id: '1', name: 'Test' };

      MockEntity.build.mockReturnValue(mockResult);

      const result = await repository.build(mockData, mockOptions);

      expect(MockEntity.build).toHaveBeenCalledWith(mockData, mockOptions);
      expect(result).toBe(mockResult);
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const mockData = { name: 'Test' };
      const mockOptions = { transaction };
      const mockResult = { id: '1', name: 'Test' };

      MockEntity.create.mockResolvedValue(mockResult);

      const result = await repository.create(mockData, mockOptions);

      expect(MockEntity.create).toHaveBeenCalledWith(mockData, mockOptions);
      expect(result).toBe(mockResult);
    });
  });

  describe('upsert', () => {
    it('should upsert a record', async () => {
      const mockData = { id: '1', name: 'Test' };
      const mockOptions = { transaction };
      const mockResult = { id: '1', name: 'Test' };

      MockEntity.upsert.mockResolvedValue(mockResult);

      const result = await repository.upsert(mockData, mockOptions);

      expect(MockEntity.upsert).toHaveBeenCalledWith(mockData, mockOptions);
      expect(result).toBe(mockResult);
    });
  });

  describe('getById', () => {
    it('should get a record by ID', async () => {
      const mockId = '1';
      const mockOptions = { transaction };
      const mockResult = { id: '1', name: 'Test' };

      MockEntity.findOne.mockResolvedValue(mockResult);

      const result = await repository.getById(mockId, mockOptions);

      expect(MockEntity.findOne).toHaveBeenCalledWith({ where: { id: mockId }, ...mockOptions });
      expect(result).toBe(mockResult);
    });
  });

  describe('update', () => {
    it('should update records and return the updated record', async () => {
      const mockWhere = { id: '1' };
      const mockData = { name: 'Updated' };
      const mockOptions = { transaction };
      const mockUpdatedRecord = { id: '1', name: 'Updated' };

      MockEntity.update.mockResolvedValue([1, [mockUpdatedRecord]]);

      const result = await repository.update(mockWhere, mockData, mockOptions);

      expect(MockEntity.update).toHaveBeenCalledWith(mockData, {
        where: mockWhere,
        ...mockOptions,
        returning: true,
      });
      expect(result).toBe(mockUpdatedRecord);
    });

    it('should update records without returning', async () => {
      const mockWhere = { id: '1' };
      const mockData = { name: 'Updated' };
      const mockOptions = { transaction, returning: false };

      MockEntity.update.mockResolvedValue([1]);

      const result = await repository.update(mockWhere, mockData, mockOptions);

      expect(MockEntity.update).toHaveBeenCalledWith(mockData, {
        where: mockWhere,
        ...mockOptions,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should get records based on a where clause', async () => {
      const mockWhere = { name: 'Test' };
      const mockOptions = { transaction };
      const mockResult = [{ id: '1', name: 'Test' }];

      MockEntity.findAll.mockResolvedValue(mockResult);

      const result = await repository.get(mockWhere, mockOptions);

      expect(MockEntity.findAll).toHaveBeenCalledWith({
        where: mockWhere,
        ...mockOptions,
      });
      expect(result).toBe(mockResult);
    });

    it('should get records with pagination', async () => {
      const mockWhere = { name: 'Test' };
      const mockOptions = {
        transaction,
        pagination: { offset: 0, limit: 10 },
      };
      const mockResult = [{ id: '1', name: 'Test' }];

      MockEntity.findAll.mockResolvedValue(mockResult);

      const result = await repository.get(mockWhere, mockOptions);

      expect(MockEntity.findAll).toHaveBeenCalledWith({
        where: mockWhere,
        transaction,
        offset: 0,
        limit: 10,
      });
      expect(result).toBe(mockResult);
    });
  });

  describe('getOne', () => {
    it('should get a single record based on a where clause', async () => {
      const mockWhere = { id: '1' };
      const mockOptions = { transaction };
      const mockResult = { id: '1', name: 'Test' };

      MockEntity.findOne.mockResolvedValue(mockResult);

      const result = await repository.getOne(mockWhere, mockOptions);

      expect(MockEntity.findOne).toHaveBeenCalledWith({
        where: mockWhere,
        ...mockOptions,
      });
      expect(result).toBe(mockResult);
    });
  });

  describe('count', () => {
    it('should count records', async () => {
      const mockWhere = { name: 'Test' };
      const mockOptions = { transaction };

      MockEntity.count.mockResolvedValue(5);

      const result = await repository.count(mockWhere, mockOptions);

      expect(MockEntity.count).toHaveBeenCalledWith({
        where: mockWhere,
        ...mockOptions,
      });
      expect(result).toBe(5);
    });
  });

  describe('executeRawQuery', () => {
    it('should execute a raw SQL query', async () => {
      const mockQuery = 'SELECT * FROM users WHERE id = :id';
      const mockReplacements = { id: 1 };
      const mockResult = { id: 1, name: 'Test' };

      // @ts-expect-error: unit test cases
      sequelize.query.mockResolvedValue([mockResult]);

      const result = await repository.executeRawQuery(mockQuery, mockReplacements);

      expect(sequelize.query).toHaveBeenCalledWith(mockQuery, {
        replacements: mockReplacements,
        type: 'SELECT',
      });
      expect(result).toBe(mockResult);
    });
  });
});
