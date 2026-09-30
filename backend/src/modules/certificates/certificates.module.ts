import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService, PrismaService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
