import { Controller, Patch, Body, UseGuards, Post, Param, ParseBoolPipe, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from './domain/user-type.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your own profile details' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('me/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change your password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 401, description: 'Incorrect current password.' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(userId, dto);
    return { success: true };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset link (Placeholder)' })
  @ApiResponse({ status: 200, description: 'If email exists, a reset link is sent.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.usersService.resetPassword(dto.email);
    return { success: true, message: 'Reset email sent (placeholder).' };
  }

  @Patch('reset-password/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm a password reset using a token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token.' })
  async confirmResetPassword(@Body() dto: ConfirmResetPasswordDto) {
    await this.usersService.confirmResetPassword(dto);
    return { success: true, message: 'Password reset successfully.' };
  }

  @Patch('accept-invite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a company invite and set your password' })
  @ApiResponse({ status: 200, description: 'Invite accepted and password set.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired invite token.' })
  async acceptInvite(@Body() dto: AcceptInviteDto) {
    await this.usersService.acceptInvite(dto);
    return { success: true, message: 'Account setup complete.' };
  }

  @Patch('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email using a token' })
  @ApiResponse({ status: 200, description: 'Email verified.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token.' })
  async verifyEmail(@Query('token') token: string) {
    await this.usersService.verifyEmailWithToken(token);
    return { success: true, message: 'Email verified successfully.' };
  }

  @Patch(':id/ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ban or unban a user (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'User ban status updated.' })
  async updateBanStatus(
    @Param('id') targetUserId: string,
    @Query('isBanned', ParseBoolPipe) isBanned: boolean,
  ) {
    await this.usersService.banUser(targetUserId, isBanned);
    return { success: true, isBanned };
  }
}
