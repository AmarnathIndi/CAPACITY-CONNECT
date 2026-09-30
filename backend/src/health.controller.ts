import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health & Telemetry')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness and readiness health probe' })
  check() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'CAPACITY CONNECT API',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      compliance: 'Government of India Air-Gapped Standard',
    };
  }
}
