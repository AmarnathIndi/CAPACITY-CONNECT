import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip, headers, user } = request;

    // Only audit mutating write operations
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (!isMutating || url.includes('/auth/login') || url.includes('/auth/refresh')) {
      return next.handle();
    }

    const action = `${method} ${url}`;
    const userAgent = headers['user-agent'] || 'Unknown Agent';
    const clientIp = (headers['x-forwarded-for'] as string) || ip || '127.0.0.1';

    return next.handle().pipe(
      tap({
        next: async (responseData) => {
          try {
            // Determine entity type from URL segments
            const urlParts = url.split('/').filter(Boolean);
            const entityType = urlParts.length > 2 ? urlParts[2].toUpperCase() : 'SYSTEM';

            // Sanitize sensitive fields from state logs
            const sanitizedBody = { ...body };
            delete sanitizedBody.password;
            delete sanitizedBody.passwordHash;
            delete sanitizedBody.twoFactorSecret;

            await this.prisma.auditLog.create({
              data: {
                userId: user?.id || null,
                userEmail: user?.email || 'ANONYMOUS',
                ipAddress: clientIp,
                userAgent: userAgent.substring(0, 255),
                action,
                entityType,
                entityId: responseData?.id || request.params?.id || null,
                beforeState: sanitizedBody || {},
                afterState: typeof responseData === 'object' ? responseData : { status: 'SUCCESS' },
              },
            });
          } catch (err) {
            this.logger.warn(`Failed to write immutable audit record: ${err.message}`);
          }
        },
      }),
    );
  }
}
