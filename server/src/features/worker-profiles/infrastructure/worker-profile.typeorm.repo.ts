import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkerProfileRepositoryInterface,
  CreateWorkerProfileParams,
  UpdateWorkerProfileParams,
  AddMachineSkillParams,
  UpdateMachineSkillParams,
  WorkerProfileSearchResult,
  WorkerProfileSearchCriteria,
} from '../domain/worker-profile.repo.interface';
import type {
  PageResultWithHasNext,
  PaginationOptions,
} from '@/common/pagination/pagination.types';
import { WorkerProfile } from '../domain/worker-profile.entity';
import { WorkerProfileOrmEntity } from './worker-profile.orm-entity';
import { WorkerMachineSkill } from '../domain/worker-machine-skill.entity';
import { WorkerMachineSkillOrmEntity } from './worker-machine-skill.orm-entity';
import { EXPERIENCE_LEVEL_RANK } from '@/features/jobs/domain/exp-level.enum';
import { MAX_WORKER_PROFILE_SEARCH_PAGE } from '../worker-profile-search.constants';

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

  async findProfileIdsByUserIds(
    userIds: string[],
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (!userIds || userIds.length === 0) {
      return map;
    }

    const rawRows = await this.repository
      .createQueryBuilder('wp')
      .select(['wp.id AS "id"', 'wp.userId AS "userId"'])
      .where('wp.userId IN (:...userIds)', { userIds })
      .getRawMany<{ id: string; userId: string }>();

    for (const row of rawRows) {
      map.set(row.userId, row.id);
    }

    return map;
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

  async findByCriteria(
    criteria: WorkerProfileSearchCriteria,
    pagination: PaginationOptions,
  ): Promise<PageResultWithHasNext<WorkerProfileSearchResult>> {
    const experienceRankSql = `
    CASE matchingSkill.experienceLevel
      WHEN 'ENTRY_LEVEL' THEN 1
      WHEN 'SKILLED' THEN 2
      WHEN 'SENIOR' THEN 3
      WHEN 'EXPERT' THEN 4
      ELSE 0
    END
  `;

    const skillConditions: string[] = [];
    const skillParams: Record<string, string | number> = {};

    if (criteria.machineId) {
      skillConditions.push('matchingSkill.machineId = :machineId');
      skillParams.machineId = criteria.machineId;
    }

    if (criteria.experienceLevel) {
      skillConditions.push(`${experienceRankSql} >= :experienceLevelRank`);

      skillParams.experienceLevelRank =
        EXPERIENCE_LEVEL_RANK[criteria.experienceLevel];
    }

    const matchingProfilesQuery = this.repository
      .createQueryBuilder('profile')
      .innerJoin('profile.user', 'user')
      .innerJoin(
        'profile.skills',
        'matchingSkill',
        skillConditions.join(' AND '),
        skillParams,
      )
      .select([
        'profile.id AS "id"',
        'profile.title AS "title"',
        'profile.country AS "country"',
        'profile.city AS "city"',
        'profile.createdAt AS "createdAt"',
        'user.firstName AS "firstName"',
        'user.lastName AS "lastName"',
        'user.avatarURL AS "avatarURL"',
      ])
      .addSelect(experienceRankSql, 'experienceRank')
      .addSelect('matchingSkill.yearsOfExperience', 'yearsOfExperience');

    if (!criteria.machineId) {
      matchingProfilesQuery.addSelect(
        `
        ROW_NUMBER() OVER (
          PARTITION BY profile.id
          ORDER BY
            ${experienceRankSql} DESC,
            matchingSkill.yearsOfExperience DESC,
            matchingSkill.id ASC
        )
      `,
        'skillRowNumber',
      );
    }

    if (criteria.machineCategoryId) {
      matchingProfilesQuery.innerJoin(
        'matchingSkill.machine',
        'machine',
        'machine.categoryId = :machineCategoryId',
        { machineCategoryId: criteria.machineCategoryId },
      );
    }

    if (criteria.country) {
      matchingProfilesQuery.andWhere('profile.country = :country', {
        country: criteria.country,
      });
    }

    if (criteria.city) {
      matchingProfilesQuery.andWhere('profile.city = :city', {
        city: criteria.city,
      });
    }

    const baseQuery = this.repository.manager
      .createQueryBuilder()
      .from(`(${matchingProfilesQuery.getQuery()})`, 'ranked')
      .setParameters(matchingProfilesQuery.getParameters());

    if (!criteria.machineId) {
      baseQuery.where('ranked."skillRowNumber" = 1');
    }

    const { page, limit } = pagination;
    const matchingProfiles = await baseQuery
      .select([
        'ranked."id" AS "id"',
        'ranked."title" AS "title"',
        'ranked."country" AS "country"',
        'ranked."city" AS "city"',
        'ranked."firstName" AS "firstName"',
        'ranked."lastName" AS "lastName"',
        'ranked."avatarURL" AS "avatarURL"',
      ])
      .orderBy('ranked."experienceRank"', 'DESC')
      .addOrderBy('ranked."yearsOfExperience"', 'DESC')
      .addOrderBy('ranked."createdAt"', 'DESC')
      .addOrderBy('ranked."id"', 'ASC')
      .skip((page - 1) * limit)
      .take(limit + 1)
      .getRawMany<WorkerProfileSearchResult>();

    const hasNext =
      page < MAX_WORKER_PROFILE_SEARCH_PAGE && matchingProfiles.length > limit;

    return {
      data: matchingProfiles.slice(0, limit),
      page,
      limit,
      hasNext,
    };
  }

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
