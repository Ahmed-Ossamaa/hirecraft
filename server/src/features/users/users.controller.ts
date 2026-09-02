import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Get,
  Delete,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiImageUpload } from '@/common/decorators/api-image-upload.decorator';
import { ImageValidationPipe } from '@/common/pipes/image-validation.pipe';
import { UsersService } from './users.service';
import { User } from './domain/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiBearerAuth()
@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get your own profile details' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user profile.',
    type: User,
  })
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update your own profile details' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
    type: User,
  })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('me/avatar')
  @ApiImageUpload('image')
  @ApiOperation({ summary: 'Upload or update your avatar' })
  @ApiResponse({ status: 200, description: 'Avatar updated successfully.' })
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
  ) {
    const updatedUser = await this.usersService.uploadAvatar(userId, file);
    return { success: true, avatarURL: updatedUser.avatarURL };
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Remove your avatar' })
  @ApiResponse({ status: 200, description: 'Avatar removed successfully.' })
  async removeAvatar(@CurrentUser('id') userId: string) {
    await this.usersService.removeAvatar(userId);
    return { success: true };
  }
}
