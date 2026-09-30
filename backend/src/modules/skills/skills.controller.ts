import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Skill Graph & Expert Finder')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('skills')
export class SkillsController {
  constructor(private skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all registered skills in the IMD taxonomy' })
  async getAllSkills() {
    return this.skillsService.getAllSkills();
  }

  @Get('expert-finder')
  @ApiOperation({ summary: 'Natural language search for ranked meteorological experts' })
  async findExperts(
    @Query('q') query?: string,
    @Query('language') language?: string,
    @Query('region') region?: string,
    @Query('minRating') minRating?: number,
  ) {
    return this.skillsService.findExperts(query, language, region, minRating ? Number(minRating) : undefined);
  }

  @Get('gap-report')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN: Office skill-gap matrix and competence heatmap' })
  async getSkillGapReport() {
    return this.skillsService.getSkillGapReport();
  }
}
