import {
  FindOptions, Includeable, WhereOptions, QueryTypes, BindOrReplacements, Transaction,
} from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { IDatabaseQueryFilters } from '../../common/interfaces/database-query-filter.interface';

export class BaseRepository<Repository> {

  constructor(
      private readonly sequelizeBase: Sequelize,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      private readonly entity: any,
      private readonly repository: typeof entity,
  ) {}

  async startTransaction(): Promise<Transaction> {
    return this.sequelizeBase.transaction();
  }

  async build(data: Partial<Repository>, options?: IDatabaseQueryFilters): Promise<Repository> {
    return this.repository.build(data, options);
  }

  async create(data: Partial<Repository>, options?: IDatabaseQueryFilters): Promise<Repository> {
    return this.repository.create(data, options);
  }

  async upsert(data: Partial<Repository>, options?: IDatabaseQueryFilters): Promise<Repository> {
    return this.repository.upsert(data, options);
  }

  async getById(id: string, options?: IDatabaseQueryFilters): Promise<Repository> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  async update(
      where: WhereOptions<Repository>,
      dataToUpdate: Partial<Repository>,
      options: IDatabaseQueryFilters = {},
  ): Promise<Repository | undefined> {
    if (options?.returning === false) {
      await this.repository.update(dataToUpdate, { where, ...options });
      return undefined;
    }

    const [, [updatedRecords]] = await this.repository.update(dataToUpdate, {
      where,
      ...options,
      returning: true,
    });

    return updatedRecords;
  }

  async get(
      where: WhereOptions<Repository>,
      options: IDatabaseQueryFilters = {},
  ): Promise<Repository[]> {
    const { pagination } = options;
    delete options.pagination;

    const query: FindOptions<Repository> = {
      // @ts-expect-error: templating issue
      where,
      ...options,
    };

    if (pagination) {
      query.offset = pagination.offset;
      query.limit = pagination.limit;
    }

    return this.repository.findAll(query);
  }

  async getOne(
      where: WhereOptions<Repository>,
      options: IDatabaseQueryFilters = {},
  ): Promise<Repository> {
    return this.repository.findOne({
      where,
      ...options,
    });
  }

  protected async getWithIncludes(
      where: WhereOptions<Repository>,
      includes: Includeable[],
      options: IDatabaseQueryFilters = {},
  ): Promise<Repository[]> {
    const { pagination } = options;
    delete options.pagination;
    const query: FindOptions<Repository> = {
      // @ts-expect-error: templating issue
      where,
      ...options,
      include: includes,
    };

    if (pagination) {
      query.offset = pagination.offset;
      query.limit = pagination.limit;
    }

    return this.repository.findAll(query);
  }

  protected async getWithIncludesAndCount(
      where: WhereOptions<Repository>,
      includes: Includeable[],
      options: IDatabaseQueryFilters = {},
  ): Promise<{ rows: Repository[], count: number }> {
    const { pagination } = options;
    delete options.pagination;
    const query: FindOptions<Repository> = {
      // @ts-expect-error: templating issue
      where,
      ...options,
      include: includes,
    };

    if (pagination) {
      query.offset = pagination.offset;
      query.limit = pagination.limit;
    }

    return this.repository.findAndCountAll(query);
  }

  protected async getByIdWithIncludes(
      id: string,
      includes: Includeable[],
      options: IDatabaseQueryFilters = {},
  ): Promise<Repository> {
    return this.repository.findOne({
      where: { id },
      ...options,
      include: includes,
    });
  }

  protected bulkUpsert(data: Repository[], options: IDatabaseQueryFilters = {}): Promise<Repository[]> {
    return this.repository.bulkCreate(data, {
      ...options,
    });
  }

  protected bulkCreate(data: Repository[], options: IDatabaseQueryFilters = {}): Promise<Repository[]> {
    return this.repository.bulkCreate(data, {
      ...options,
    });
  }

  async count(where: WhereOptions<Repository>, options: IDatabaseQueryFilters = {}): Promise<number> {
    return this.repository.count({
      where,
      ...options,
    });
  }

  protected destroy(where: WhereOptions<Repository>, options: IDatabaseQueryFilters = {}): Promise<number> {
    return this.repository.destroy({
      where,
      ...options,
    });
  }

  async executeRawQuery(query: string, replacements: BindOrReplacements | undefined ): Promise<any> {
    const [results] = await this.sequelizeBase.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
    return results;
  }
}
