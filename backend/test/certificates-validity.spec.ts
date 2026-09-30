import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CertificatesService } from '../src/modules/certificates/certificates.service';
import { CertificateStatus } from '@prisma/client';

describe('CertificatesService - Public Verification & Expiry Engine', () => {
  let service: CertificatesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      certificate: {
        findUnique: vi.fn(),
      },
    };

    service = new CertificatesService(mockPrisma);
  });

  it('should return isValid=true and details for an active valid certificate', async () => {
    const futureExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    mockPrisma.certificate.findUnique.mockResolvedValue({
      id: 'CERT-IMD-2026-001',
      verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      recipientName: 'Dr. Aarav Sharma',
      courseTitle: 'Doppler Weather Radar (DWR) Operational Principles',
      issueDate: new Date(),
      expiryDate: futureExpiry,
      status: CertificateStatus.VALID,
      user: { office: 'Delhi HQ', region: 'North' },
    });

    const result = await service.verifyCertificate('CERT-IMD-2026-001');

    expect(result.isValid).toBe(true);
    expect(result.status).toBe(CertificateStatus.VALID);
    expect(result.recipientName).toBe('Dr. Aarav Sharma');
    expect(result.office).toBe('Delhi HQ');
  });

  it('should mark an expired certificate as EXPIRED and isValid=false', async () => {
    const pastExpiry = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // Expired 10 days ago

    mockPrisma.certificate.findUnique.mockResolvedValue({
      id: 'CERT-IMD-2024-999',
      verificationHash: 'some-hash',
      recipientName: 'Dr. Priya Nair',
      courseTitle: 'Radar Operations',
      issueDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
      expiryDate: pastExpiry,
      status: CertificateStatus.VALID,
      user: { office: 'Chennai RMC', region: 'South' },
    });

    const result = await service.verifyCertificate('CERT-IMD-2024-999');

    expect(result.isValid).toBe(false);
    expect(result.status).toBe(CertificateStatus.EXPIRED);
  });

  it('should return isValid=false for non-existent certificate ID', async () => {
    mockPrisma.certificate.findUnique.mockResolvedValue(null);

    const result = await service.verifyCertificate('CERT-FAKE-999');

    expect(result.isValid).toBe(false);
    expect(result.status).toBe('INVALID');
  });
});
