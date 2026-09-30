import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CertificateStatus } from '@prisma/client';
import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async getMyCertificates(userId: string) {
    const certs = await this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issueDate: 'desc' },
    });

    const now = new Date();

    return certs.map((c) => {
      const isExpiringSoon =
        c.status === CertificateStatus.VALID &&
        c.expiryDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000;

      return {
        id: c.id,
        courseId: c.courseId,
        recipientName: c.recipientName,
        courseTitle: c.courseTitle,
        issueDate: c.issueDate.toISOString().split('T')[0],
        expiryDate: c.expiryDate.toISOString().split('T')[0],
        verificationHash: c.verificationHash,
        status: c.status.toLowerCase(),
        isExpiringSoon,
        verificationUrl: `/verify/${c.id}`,
      };
    });
  }

  async verifyCertificate(certId: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id: certId },
      include: {
        user: { select: { office: true, region: true } },
      },
    });

    if (!cert) {
      return {
        isValid: false,
        status: 'INVALID',
        message: 'No certificate found with this identifier in the IMD national registry.',
      };
    }

    const now = new Date();
    let currentStatus = cert.status;
    if (cert.status === CertificateStatus.VALID && cert.expiryDate < now) {
      currentStatus = CertificateStatus.EXPIRED;
    }

    return {
      isValid: currentStatus === CertificateStatus.VALID,
      status: currentStatus,
      certificateId: cert.id,
      recipientName: cert.recipientName,
      courseTitle: cert.courseTitle,
      office: cert.user?.office || 'Delhi HQ',
      region: cert.user?.region || 'North',
      issueDate: cert.issueDate.toISOString().split('T')[0],
      expiryDate: cert.expiryDate.toISOString().split('T')[0],
      verificationHash: cert.verificationHash,
      authority: 'Capacity Building Commission & Training Directorate, India Meteorological Department',
    };
  }

  async revokeCertificate(certId: string, reason: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { id: certId } });
    if (!cert) {
      throw new NotFoundException(`Certificate ${certId} not found`);
    }

    const updated = await this.prisma.certificate.update({
      where: { id: certId },
      data: { status: CertificateStatus.REVOKED },
    });

    return {
      success: true,
      message: `Certificate ${certId} has been revoked. Reason: ${reason}`,
      certificate: updated,
    };
  }

  async getTranscript(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        certificates: { where: { status: 'VALID' } },
        enrollments: { include: { course: true } },
        testAttempts: {
          where: { isPassed: true },
          include: { test: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Officer record not found');
    }

    return {
      officer: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        office: user.office,
        designation: user.profile?.designation,
      },
      completedCourses: user.enrollments
        .filter((e) => e.completed)
        .map((e) => ({
          courseId: e.courseId,
          title: e.course.titleEn,
          titleHi: e.course.titleHi,
          category: e.course.category,
          duration: `${e.course.durationHours} Hours`,
          completedDate: e.completedAt ? e.completedAt.toISOString().split('T')[0] : 'N/A',
        })),
      examinationsPassed: user.testAttempts.map((a) => ({
        testId: a.testId,
        testTitle: a.test.titleEn,
        score: `${a.score}%`,
        date: a.submittedAt ? a.submittedAt.toISOString().split('T')[0] : 'N/A',
      })),
      certificatesEarned: user.certificates.map((c) => ({
        id: c.id,
        title: c.courseTitle,
        issueDate: c.issueDate.toISOString().split('T')[0],
        expiryDate: c.expiryDate.toISOString().split('T')[0],
        hash: c.verificationHash,
      })),
    };
  }

  async generateCertificatePdf(certId: string): Promise<Buffer> {
    const cert = await this.prisma.certificate.findUnique({
      where: { id: certId },
      include: { user: true },
    });

    if (!cert) {
      throw new NotFoundException(`Certificate ${certId} not found`);
    }

    const verificationUrl = `https://capacityconnect.imd.gov.in/verify/${cert.id}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 120, margin: 1 });
    const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 40,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Certificate Border Styling
      doc.rect(20, 20, 802, 555).lineWidth(4).stroke('#002D62');
      doc.rect(26, 26, 790, 543).lineWidth(1.5).stroke('#F97316');

      // Header
      doc.fontSize(14).fillColor('#002D62').text('GOVERNMENT OF INDIA', { align: 'center' });
      doc.fontSize(11).fillColor('#4B5563').text('MINISTRY OF EARTH SCIENCES | INDIA METEOROLOGICAL DEPARTMENT', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(28).fillColor('#002D62').text('CERTIFICATE OF OPERATIONAL COMPETENCY', { align: 'center' });
      doc.fontSize(13).fillColor('#F97316').text('क्षमता सेतु (CAPACITY CONNECT) PRASHIKSHAN PRAMAN PATRA', { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(12).fillColor('#374151').text('This is to officially certify that', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(22).fillColor('#002D62').text(cert.recipientName.toUpperCase(), { align: 'center' });
      doc.fontSize(11).fillColor('#6B7280').text(`Office: ${cert.user?.office || 'IMD Headquarters, New Delhi'}`, { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(12).fillColor('#374151').text('has successfully demonstrated operational excellence and cleared the professional assessment for:', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(18).fillColor('#002D62').text(`"${cert.courseTitle}"`, { align: 'center' });
      doc.moveDown(1.5);

      // Signatures and Dates
      const startY = 440;
      doc.fontSize(10).fillColor('#374151');
      doc.text(`Certificate ID: ${cert.id}`, 50, startY);
      doc.text(`Issue Date: ${cert.issueDate.toISOString().split('T')[0]}`, 50, startY + 16);
      doc.text(`Valid Until: ${cert.expiryDate.toISOString().split('T')[0]}`, 50, startY + 32);
      doc.fontSize(8).fillColor('#9CA3AF').text(`SHA256: ${cert.verificationHash.substring(0, 32)}...`, 50, startY + 48);

      // Embed QR code on the right side
      doc.image(qrImageBuffer, 660, 410, { width: 100 });
      doc.fontSize(8).fillColor('#6B7280').text('Scan to Verify Online', 660, 520, { align: 'center', width: 100 });

      doc.end();
    });
  }
}
