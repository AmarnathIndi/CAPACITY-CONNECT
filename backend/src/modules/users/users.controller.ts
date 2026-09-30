import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, ApproveUserDto, RejectUserDto, BulkImportConfirmDto } from './dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users & Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current officer profile, skills, badges, and points' })
  async getMe(@CurrentUser() user: any) {
    return this.usersService.getMe(user.sub);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update personal officer profile, qualifications, skills' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Get('pending')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN: List pending officer approval requests' })
  async getPendingUsers() {
    return this.usersService.getPendingUsers();
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN: Approve registration and assign role' })
  async approveUser(
    @Param('id') id: string,
    @Body() dto: ApproveUserDto,
  ) {
    return this.usersService.approveUser(id, dto);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN: Reject registration with reason' })
  async rejectUser(
    @Param('id') id: string,
    @Body() dto: RejectUserDto,
  ) {
    return this.usersService.rejectUser(id, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN: Get all system users with search & filters' })
  async getAllUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('office') office?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.getAllUsers(search, role, office, status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN: Remove user account' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Post('bulk-import/preview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN: Preview and validate bulk CSV/JSON staff upload' })
  async previewBulkImport(@Body() body: { rows: any[] }) {
    return this.usersService.previewBulkImport(body.rows || []);
  }

  @Post('bulk-import/confirm')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN: Execute transaction import of valid bulk staff rows' })
  async confirmBulkImport(@Body() dto: BulkImportConfirmDto) {
    return this.usersService.confirmBulkImport(dto);
  }
}
