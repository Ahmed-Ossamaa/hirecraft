import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  type WorkerProfileRepositoryInterface,
  WORKER_PROFILE_REPOSITORY,
  CreateWorkerProfileParams,
} from './domain/worker-profile.repo.interface';
import { WorkerProfile } from './domain/worker-profile.entity';
import { CreateWorkerProfileDto } from './dto/create-worker-profile.dto';
import { AddMachineSkillDto } from './dto/add-machine-skills.dto';
import { WorkerMachineSkill } from './domain/worker-machine-skill.entity';
import { UpdateWorkerProfileDto } from './dto/update-worker-profile.dto';
import { UpdateMachineSkillDto } from './dto/update-machine-skill.dto';

@Injectable()
export class WorkerProfilesService {
  constructor(
    @Inject(WORKER_PROFILE_REPOSITORY)
    private readonly profileRepository: WorkerProfileRepositoryInterface,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateWorkerProfileDto,
  ): Promise<WorkerProfile> {
    // A user can only have 1 profile.
    const profileExists = await this.profileRepository.existsByUserId(userId);

    if (profileExists) {
      throw new ConflictException('You already have a worker profile.');
    }

    const profile: CreateWorkerProfileParams = {
      userId,
      title: dto.title,
      lastCompany: dto.lastCompany,
      bio: dto.bio,
      country: dto.country,
      city: dto.city,
    };

    return this.profileRepository.create(profile);
  }

  async addSkill(
    userId: string,
    dto: AddMachineSkillDto,
  ): Promise<WorkerMachineSkill> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException(
        'You must create a worker profile before adding skills.',
      );
    }

    // Prevent duplicate machines
    const alreadyHasMachine = profile.skills?.some(
      (skill) => skill.machineId === dto.machineId,
    );

    if (alreadyHasMachine) {
      throw new ConflictException(
        'You have already added this machine to your profile.',
      );
    }
    const skill = await this.profileRepository.addSkill(profile.id, {
      machineId: dto.machineId,
      experienceLevel: dto.experienceLevel,
      yearsOfExperience: dto.yearsOfExperience,
    });

    return skill;
  }

  async updateProfile(
    userId: string,
    dto: UpdateWorkerProfileDto,
  ): Promise<WorkerProfile> {
    const updatedProfile = await this.profileRepository.update(userId, dto);

    if (!updatedProfile) {
      throw new NotFoundException(
        'Profile not found. Please create one first.',
      );
    }

    return updatedProfile;
  }

  async updateSkill(
    userId: string,
    skillId: string,
    dto: UpdateMachineSkillDto,
  ): Promise<WorkerMachineSkill> {
    const profileId = await this.getProfileId(userId);
    const updated = await this.profileRepository.updateSkill(
      skillId,
      dto,
      profileId,
    );
    if (!updated) {
      throw new NotFoundException(`Skill not found or you don't own it`);
    }

    return updated;
  }

  async deleteSkill(userId: string, skillId: string): Promise<WorkerProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found.');

    const ownsSkill = profile.skills?.some((skill) => skill.id === skillId);
    if (!ownsSkill)
      throw new NotFoundException(`Skill not found on your profile.`);

    await this.profileRepository.deleteSkill(skillId);
    profile.skills = profile.skills?.filter((s) => s.id !== skillId);

    return profile;
  }

  /**
   * @description Get my own profile data
   * @param userId user-id
   * @throws {NotFoundException} if the worker profile does not exist
   */
  async getMyProfile(userId: string): Promise<WorkerProfile> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException(
        'This profile does not exist. Please create one.',
      );
    }

    return profile;
  }

  /**
   * @description Get  a worker profile by ID
   * @param id  worker profile-id
   * @throws {NotFoundException} if the worker profile does not exist
   */
  async getProfileById(id: string): Promise<WorkerProfile> {
    const profile = await this.profileRepository.findById(id);

    if (!profile) {
      throw new NotFoundException(`Worker profile with ID ${id} not found.`);
    }

    return profile;
  }

  async getProfileId(userId: string): Promise<string> {
    const profileId = await this.profileRepository.getProfileId(userId);

    if (!profileId) throw new NotFoundException('Worker profile not found.');
    return profileId;
  }
}
