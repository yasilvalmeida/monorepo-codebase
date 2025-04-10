import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Detailed health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service health details' })
  async getDetailedHealth() {
    return this.appService.getHealthStatus();
  }
}
