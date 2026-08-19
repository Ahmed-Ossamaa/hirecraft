import { Company } from './company.entity';

export const COMPANY_REPOSITORY = Symbol('COMPANY_REPOSITORY');

export type CreateCompanyParams = {
  name: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  coverUrl?: string | null;
  coverPublicId?: string | null;
  description?: string;
  location?: string;
  size?: string;
  industry?: string;
};

export interface ICompanyRepository {
  create(params: CreateCompanyParams, tx?: any): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  update(
    id: string,
    params: Partial<CreateCompanyParams>,
  ): Promise<Company | null>;
}
