import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

export interface IQueryRunnerFactory {
  createTransactionalRunner(): Promise<QueryRunner>;
}

@Injectable()
export class QueryRunnerFactory implements IQueryRunnerFactory {
  constructor(private readonly dataSource: DataSource) {}

  async createTransactionalRunner(): Promise<QueryRunner> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    return runner;
  }
}
