export class Company {
  id!: string;
  name!: string;
  logoUrl?: string;
  coverUrl?: string;
  description?: string;
  location?: string;
  size?: string;
  industry?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
