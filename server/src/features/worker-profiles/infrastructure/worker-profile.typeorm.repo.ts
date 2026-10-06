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

    return savedSkill;
  }
  async update(
    userId: string,
    params: UpdateWorkerProfileParams,
  ): Promise<WorkerProfile | null> {
    const result = await this.repository
      .createQueryBuilder()
      .update(WorkerProfileOrmEntity)
      .set(params)
      .where('userId = :userId', { userId })
      .returning('*')
      .execute();

    const rawRows = result.raw as Record<string, any>[];
    if (!rawRows || !rawRows[0]) return null;
    return this.mapToDomain(rawRows[0] as WorkerProfileOrmEntity);
  }

  async findByUserId(userId: string): Promise<WorkerProfile | null> {
    const profile = await this.repository
      .createQueryBuilder('profile')
      .where('profile.userId = :userId', { userId })
      .leftJoin('profile.user', 'user')
      .addSelect([
        'user.firstName',
        'user.lastName',
        'user.avatarURL',
        'user.dob',
        'user.gender',
        'user.phoneNumber',
        'user.email',
      ])
      .leftJoinAndSelect('profile.skills', 'skills')
      .leftJoinAndSelect('skills.machine', 'machine')
      .getOne();

    return profile ? this.mapToDomain(profile) : null;
  }

  async findById(id: string): Promise<WorkerProfile | null> {
    const profile = await this.repository
      .createQueryBuilder('profile')
      .where('profile.id = :id', { id })
      .leftJoin('profile.user', 'user')
      .addSelect([
        'user.firstName',
        'user.lastName',
        'user.avatarURL',
        'user.dob',
        'user.gender',
        'user.phoneNumber',
        'user.email',
      ])
      .leftJoinAndSelect('profile.skills', 'skills')
      .leftJoinAndSelect('skills.machine', 'machine')
      .leftJoinAndSelect('machine.category', 'category')
      .getOne();

    return profile ? this.mapToDomain(profile) : null;
  }

  async getProfileId(userId: string): Promise<string | null> {
    const profile = await this.repository.findOne({
      where: { userId },
      select: { id: true },
    });

    return profile ? profile.id : null;
  }

  async existsByUserId(userId: string): Promise<boolean> {
    return this.repository.exists({ where: { userId } });
  }

  async updateSkill(
    skillId: string,
    params: UpdateMachineSkillParams,
    profileId: string,
  ): Promise<WorkerMachineSkill | null> {
    const result = await this.skillRepository
      .createQueryBuilder()
      .update(WorkerMachineSkillOrmEntity)
      .set(params)
      .where('id = :skillId AND workerProfileId = :profileId', {
        skillId,
        profileId,
      })
      .returning('*')
      .execute();

    const rawRows = result.raw as Record<string, any>[];
    if (!rawRows || !rawRows[0]) return null;

    return rawRows[0] as WorkerMachineSkill;
  }

  async deleteSkill(skillId: string): Promise<void> {
    await this.skillRepository.delete(skillId);
  }

  //-------------------------
  private mapToDomain(orm: WorkerProfileOrmEntity): WorkerProfile {
    const profile = new WorkerProfile();

    Object.assign(profile, orm);

    if (orm.user) {
      profile.firstName = orm.user.firstName;
      profile.lastName = orm.user.lastName;
      profile.avatarURL = orm.user.avatarURL;
      profile.dob = orm.user.dob;
      profile.gender = orm.user.gender;
      profile.phone = orm.user.phoneNumber;
      profile.email = orm.user.email;
    }

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
