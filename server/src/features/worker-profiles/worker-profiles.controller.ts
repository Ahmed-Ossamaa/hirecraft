import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Delete,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WorkerProfilesService } from './worker-profiles.service';
import { CreateWorkerProfileDto } from './dto/create-worker-profile.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '../users/domain/user-type.enum';
import { RolesGuard } from '@/common/guards/role.guard';
import { WorkerProfile } from './domain/worker-profile.entity';
import { AddMachineSkillDto } from './dto/add-machine-skills.dto';
import { WorkerMachineSkill } from './domain/worker-machine-skill.entity';
import { UpdateMachineSkillDto } from './dto/update-machine-skill.dto';
import { UpdateWorkerProfileDto } from './dto/update-worker-profile.dto';

@ApiTags('Worker Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('worker-profiles')
export class WorkerProfilesController {
  constructor(private readonly profilesService: WorkerProfilesService) {}

  @Post()
  @Roles(UserType.CANDIDATE)
  @ApiOperation({
    summary: 'Create a new worker profile for the logged-in user',
  })
  @ApiResponse({
    status: 201,
    description: 'worker profile has been successfully created',
    type: WorkerProfile,
  })
  @ApiResponse({ status: 409, description: 'User already has a profile.' })
  async createProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkerProfileDto,
  ) {
    return this.profilesService.createProfile(userId, dto);
  }

  @Post('skills')
  @Roles(UserType.CANDIDATE)
  @ApiOperation({
    summary: "Add a new machine skill to the logged-in worker's profile",
  })
  @ApiResponse({
    status: 201,
    description: 'Skill successfully added.',
    type: WorkerMachineSkill,
  })
  @ApiResponse({ status: 404, description: 'Worker profile not found.' })
  @ApiResponse({
    status: 409,
    description: 'Skill for this machine already exists.',
  })
  async addSkill(
    @CurrentUser('id') userId: string,
    @Body() dto: AddMachineSkillDto,
  ) {
    return this.profilesService.addSkill(userId, dto);
  }

  @Get('me')
  @Roles(UserType.CANDIDATE)
  @ApiOperation({
    summary: 'Retrieve the profile of the currently logged-in worker',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the worker profile with skills.',
    type: WorkerProfile,
  })
  @ApiResponse({ status: 404, description: 'Worker profile not found.' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.profilesService.getMyProfile(userId);
  }

  @Get(':id')
  @Roles(UserType.EMPLOYER)
  @ApiOperation({
    summary: 'Get a specific worker profile by its ID (For employers)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the requested worker profile.',
    type: WorkerProfile,
  })
  @ApiResponse({ status: 404, description: 'Worker profile not found.' })
  async getProfileById(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.getProfileById(id);
  }

  @Patch()
  @Roles(UserType.CANDIDATE)
  @ApiOperation({ summary: "Update the logged-in worker's profile" })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated worker profile.',
    type: WorkerProfile,
  })
  @ApiResponse({ status: 404, description: 'Worker profile not found.' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateWorkerProfileDto,
  ) {
    return this.profilesService.updateProfile(userId, dto);
  }

  @Patch('skills/:skillId')
  @Roles(UserType.CANDIDATE)
  @ApiOperation({ summary: 'Update an existing machine skill' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated worker profile.',
    type: WorkerProfile,
  })
  @ApiResponse({ status: 404, description: 'Worker profile not found.' })
  async updateSkill(
    @CurrentUser('id') userId: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Body() dto: UpdateMachineSkillDto,
  ) {
    return this.profilesService.updateSkill(userId, skillId, dto);
  }

  @Delete('skills/:skillId')
  @Roles(UserType.CANDIDATE)
  @ApiOperation({ summary: 'Delete a machine skill from the profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated worker profile.',
    type: WorkerProfile,
  })
  @ApiResponse({ status: 404, description: 'Worker profile not found.' })
  async deleteSkill(
    @CurrentUser('id') userId: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ) {
    return this.profilesService.deleteSkill(userId, skillId);
  }
}
