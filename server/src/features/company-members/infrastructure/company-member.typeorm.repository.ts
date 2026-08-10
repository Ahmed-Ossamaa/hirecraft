import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(params: CreateCompanyMemberParams): Promise<CompanyMember> {
    const ormEntity = this.repository.create(params);
    const savedEntity = await this.repository.save(ormEntity);
    return this.mapToDomain(savedEntity);
  }

  private mapToDomain(orm: CompanyMemberOrmEntity): CompanyMember {
    const member = new CompanyMember();
    Object.assign(member, orm);
    return member;
  }
}
