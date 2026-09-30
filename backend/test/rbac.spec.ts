import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('RolesGuard - Role-Based Access Control', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (userRole?: string): ExecutionContext => {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { sub: 'usr-123', role: userRole } : null,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should deny access and throw ForbiddenException if user has TRAINEE role on ADMIN endpoint', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    const context = createMockContext('TRAINEE');

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access if user has ADMIN role on ADMIN endpoint', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    const context = createMockContext('ADMIN');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if endpoint has no role requirements', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

    const context = createMockContext('TRAINEE');

    expect(guard.canActivate(context)).toBe(true);
  });
});
