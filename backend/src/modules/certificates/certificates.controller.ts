import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Certificates & Verification')
@Controller()
export class CertificatesController {
  constructor(private certsService: CertificatesService) {}

  @Public()
  @Get('verify/:id')
  @ApiOperation({ summary: 'PUBLIC: Rate-limited verification endpoint for certificate validity' })
  async verify(@Param('id') id: string) {
    return this.certsService.verifyCertificate(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('certificates/my')
  @ApiOperation({ summary: 'List certificates earned by current officer' })
  async getMyCertificates(@CurrentUser() user: any) {
    return this.certsService.getMyCertificates(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('certificates/transcript')
  @ApiOperation({ summary: 'Get official printable academic transcript record' })
  async getTranscript(@CurrentUser() user: any) {
    return this.certsService.getTranscript(user.sub);
  }

  @Public()
  @Get('certificates/:id/download')
  @ApiOperation({ summary: 'Download official stamped bilingual certificate PDF' })
  async downloadPdf(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.certsService.generateCertificatePdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=IMD-Certificate-${id}.pdf`);
    res.send(pdfBuffer);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('certificates/:id/revoke')
  @ApiOperation({ summary: 'ADMIN: Revoke a compromised certificate' })
  async revokeCertificate(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.certsService.revokeCertificate(id, reason || 'Administrative action');
  }
}
