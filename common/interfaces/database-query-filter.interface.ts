import { Attributes, Order, Transaction } from 'sequelize';

export interface IDatabaseQueryFilters {
  attributes?: Attributes<any>;
  group?: string[];
  order?: Order;
  pagination?: IPagination;
  raw?: boolean;
  returning?: boolean;
  subQuery?: boolean;
  transaction?: Transaction;
  updateOnDuplicate?: string[];
  lock?: any;
  where?: {
    [key: string]: any;
  }
}

export interface IPagination {
  offset?: number;
  limit: number;
}
