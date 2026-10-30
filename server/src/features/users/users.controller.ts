import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Get,
  Delete,
  UploadedFile,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { ApiImageUpload } from '@/common/decorators/api-image-upload.decorator';
import { ImageValidationPipe } from '@/common/pipes/image-validation.pipe';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
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
  @ApiStandardResponse(UserResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Returns the user profile.',
  })
  async getProfile(
    @CurrentUser('id') userId: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return UserResponseDto.fromDomain(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update your own profile details' })
  @ApiStandardResponse(UserResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
  })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const updated = await this.usersService.updateProfile(userId, dto);
    return UserResponseDto.fromDomain(updated);
  }

  @Patch('me/avatar')
  @ApiImageUpload('image')
  @ResponseMessage('Avatar updated successfully.')
  @ApiOperation({ summary: 'Upload or update your avatar' })
  @ApiResponse({ status: 200, description: 'Avatar updated successfully.' })
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
  ) {
    const updatedUser = await this.usersService.uploadAvatar(userId, file);
    return { avatarURL: updatedUser.avatarURL };
  }

  @Delete('me/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove your avatar' })
  @ApiResponse({ status: 204, description: 'Avatar removed successfully.' })
  async removeAvatar(@CurrentUser('id') userId: string) {
    await this.usersService.removeAvatar(userId);
  }
}
