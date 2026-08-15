import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkerProfileRepositoryInterface,
  CreateWorkerProfileParams,
  UpdateWorkerProfileParams,
} from '../domain/worker-profile.repo.interface';
import { WorkerProfile } from '../domain/worker-profile.entity';
import { WorkerProfileOrmEntity } from './worker-profile.orm-entity';
import { WorkerMachineSkill } from '../domain/worker-machine-skill.entity';

@Injectable()
export class WorkerProfileTypeormRepository implements WorkerProfileRepositoryInterface {
  constructor(
    @InjectRepository(WorkerProfileOrmEntity)
    private readonly repository: Repository<WorkerProfileOrmEntity>,
  ) {}

  async create(params: CreateWorkerProfileParams): Promise<WorkerProfile> {
    const profile = this.repository.create(params);
    const savedProfile = await this.repository.save(profile);
    return this.mapToDomain(savedProfile);
  }

  async update(
    id: string,
    params: UpdateWorkerProfileParams,
  ): Promise<WorkerProfile | null> {
    await this.repository.update(id, params);

    return this.findById(id);
  }

  async findByUserId(userId: string): Promise<WorkerProfile | null> {
    const profile = await this.repository.findOne({
      where: { userId },
      relations: {
        skills: {
          machine: true,
        },
      },
    });
    return profile ? this.mapToDomain(profile) : null;
  }

  async findById(id: string): Promise<WorkerProfile | null> {
    const profile = await this.repository.findOne({
      where: { id },
      relations: {
        skills: {
          machine: true,
        },
      },
    });
    return profile ? this.mapToDomain(profile) : null;
  }

  private mapToDomain(orm: WorkerProfileOrmEntity): WorkerProfile {
    const profile = new WorkerProfile();

    Object.assign(profile, orm);

    if (orm.skills) {
      profile.skills = orm.skills.map((ormSkill) => {
        const skill = new WorkerMachineSkill();
        Object.assign(skill, ormSkill);

        skill.machineNameEn = ormSkill.machine?.nameEn;
        skill.machineNameAr = ormSkill.machine?.nameAr;

        return skill;
      });
    } else {
      profile.skills = [];
    }

    return profile;
  }
}
