import { Company } from './company.entity';
import { PaginatedResult } from '@/common/pagination/paginated-results';

export const COMPANY_REPOSITORY = Symbol('COMPANY_REPOSITORY');

export type CreateCompanyParams = {
  name: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  coverUrl?: string | null;
  coverPublicId?: string | null;
  description?: string;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  email?: string | null;
  specialties?: string[] | null;
  website?: string | null;
  foundedYear?: number | null;
  phone?: string | null;
  size?: string;
  industry?: string;
};

export interface FindCompaniesOptions {
  page?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
  search?: string;
}

export interface ICompanyRepository {
  create(params: CreateCompanyParams, tx?: any): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findByIdWithMembers(id: string): Promise<Company | null>;
  findAll(options?: FindCompaniesOptions): Promise<PaginatedResult<Company>>;
  update(
    id: string,
    params: Partial<CreateCompanyParams>,
  ): Promise<Company | null>;
}
