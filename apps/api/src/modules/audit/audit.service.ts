import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async findAll(): Promise<AuditLogEntity[]> {
    return this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
