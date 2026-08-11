import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import {
  ICompanyMemberRepository,
  CreateCompanyMemberParams,
} from '../domain/company-member.repo.interface';
import { CompanyMember } from '../domain/company-member.entity';
import { CompanyMemberOrmEntity } from './company-member.orm-entity';

@Injectable()
export class CompanyMemberTypeormRepository implements ICompanyMemberRepository {
  constructor(
    @InjectRepository(CompanyMemberOrmEntity)
    private readonly repository: Repository<CompanyMemberOrmEntity>,
  ) {}

  async create(
    params: CreateCompanyMemberParams,
    tx?: EntityManager,
  ): Promise<CompanyMember> {
    const manager = tx || this.repository.manager;
    const member = manager.create(CompanyMemberOrmEntity, params);
    const savedMember = await manager.save(member);
    return this.mapToDomain(savedMember);
  }

  async findByUserIdAndCompanyId(
    userId: string,
    companyId: string,
  ): Promise<CompanyMember | null> {
    const member = await this.repository.findOne({
      where: { userId, companyId },
    });
    return member ? this.mapToDomain(member) : null;
  }

  private mapToDomain(ormEntity: CompanyMemberOrmEntity): CompanyMember {
    const member = new CompanyMember();
    Object.assign(member, ormEntity);
    return member;
  }
}
