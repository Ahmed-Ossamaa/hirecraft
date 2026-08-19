import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkerProfileRepositoryInterface,
  CreateWorkerProfileParams,
  UpdateWorkerProfileParams,
  AddMachineSkillParams,
  UpdateMachineSkillParams,
} from '../domain/worker-profile.repo.interface';
import { WorkerProfile } from '../domain/worker-profile.entity';
import { WorkerProfileOrmEntity } from './worker-profile.orm-entity';
import { WorkerMachineSkill } from '../domain/worker-machine-skill.entity';
import { WorkerMachineSkillOrmEntity } from './worker-machine-skill.orm-entity';

@Injectable()
export class WorkerProfileTypeormRepository implements WorkerProfileRepositoryInterface {
  constructor(
    @InjectRepository(WorkerProfileOrmEntity)
    private readonly repository: Repository<WorkerProfileOrmEntity>,
    @InjectRepository(WorkerMachineSkillOrmEntity)
    private readonly skillRepository: Repository<WorkerMachineSkillOrmEntity>,
  ) {}

  async create(params: CreateWorkerProfileParams): Promise<WorkerProfile> {
    const profile = this.repository.create(params);
    const savedProfile = await this.repository.save(profile);
    return this.mapToDomain(savedProfile);
  }

  async addSkill(
    workerProfileId: string,
    params: AddMachineSkillParams,
  ): Promise<WorkerMachineSkill> {
    const skillOrm = this.skillRepository.create({
      workerProfileId,
      machineId: params.machineId,
      experienceLevel: params.experienceLevel,
      yearsOfExperience: params.yearsOfExperience,
    });

    const savedSkill = await this.skillRepository.save(skillOrm);

    const domainSkill = new WorkerMachineSkill();
    Object.assign(domainSkill, savedSkill);

    return domainSkill;
  }
  async update(
    userId: string,
    params: UpdateWorkerProfileParams,
  ): Promise<WorkerProfile | null> {
    const updateResult = await this.repository.update({ userId }, params);
    if (updateResult.affected === 0) return null;
    return this.findByUserId(userId);
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
          machine: {
            category: true,
          },
        },
      },
    });
    return profile ? this.mapToDomain(profile) : null;
  }

  async getProfileId(userId: string): Promise<string | null> {
    const profile = await this.repository.findOne({
      where: { userId },
      select: { id: true },
    });

    return profile ? profile.id : null;
  }

  async updateSkill(
    skillId: string,
    params: UpdateMachineSkillParams,
  ): Promise<void> {
    await this.skillRepository.update(skillId, params);
  }

  async deleteSkill(skillId: string): Promise<void> {
    await this.skillRepository.delete(skillId);
  }

  //-------------------------
  private mapToDomain(orm: WorkerProfileOrmEntity): WorkerProfile {
    const profile = new WorkerProfile();

    Object.assign(profile, orm);

    if (orm.skills) {
      profile.skills = orm.skills.map((ormSkill) => {
        const skill = new WorkerMachineSkill();
        Object.assign(skill, ormSkill);

        skill.machineNameEn = ormSkill.machine?.nameEn;
        skill.machineNameAr = ormSkill.machine?.nameAr;

        skill.categoryNameEn = ormSkill.machine?.category?.nameEn;
        skill.categoryNameAr = ormSkill.machine?.category?.nameAr;

        return skill;
      });
    } else {
      profile.skills = [];
    }

    return profile;
  }
}
