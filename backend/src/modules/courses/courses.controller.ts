import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto, CreateRatingDto, UploadLibraryItemDto } from './dto/courses.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Courses & Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List all published courses with search, category, and level filters' })
  async getAllCourses(
    @CurrentUser() user: any,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('level') level?: string,
  ) {
    return this.coursesService.getAllCourses(category, search, level, user?.sub);
  }

  @Get('library')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'TRAINER/ADMIN: Get shared trainer library assets' })
  async getLibrary(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.coursesService.getLibraryItems(category, search);
  }

  @Post('library')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'TRAINER/ADMIN: Upload shared teaching materials to library' })
  async uploadLibraryItem(
    @CurrentUser() user: any,
    @Body() dto: UploadLibraryItemDto,
  ) {
    return this.coursesService.addLibraryItem(user.email, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course details, syllabus, and prerequisite check' })
  async getCourseById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.getCourseById(id, user?.sub);
  }

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Enroll in course (validates prerequisites)' })
  async enroll(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.enrollCourse(id, user.sub);
  }

  @Put(':id/progress')
  @ApiOperation({ summary: 'Update trainee progress percentage and unlock completions' })
  async updateProgress(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('progress') progress: number,
  ) {
    return this.coursesService.updateProgress(id, user.sub, progress);
  }

  @Post(':id/ratings')
  @ApiOperation({ summary: 'Submit course review and star rating' })
  async rateCourse(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateRatingDto,
  ) {
    return this.coursesService.rateCourse(id, user.sub, dto);
  }

  @Post()
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: 'TRAINER/ADMIN: Author new course curriculum' })
  async createCourse(
    @CurrentUser() user: any,
    @Body() dto: CreateCourseDto,
  ) {
    return this.coursesService.createCourse(user.sub, dto);
  }

  @Get('materials/presigned-url')
  @ApiOperation({ summary: 'Get signed expiring S3 download URL for material' })
  async getSignedUrl(@Query('key') key: string) {
    return this.coursesService.getPresignedDownloadUrl(key);
  }
}
