import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Observability')
@Controller('metrics')
export class MetricsController {
  @Get()
  @ApiOperation({ summary: 'Expose Prometheus metrics' })
  async getMetrics(@Res() res: Response) {
    try {
      // The Prometheus exporter from OTel SDK runs on its own port (9464)
      // but we can also proxy it here if needed, or just let users scrape 9464 directly.
      // However, the requirement is to expose it via /metrics in the app.
      
      const response = await fetch('http://localhost:9464/metrics');
      const metrics = await response.text();
      
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(metrics);
    } catch (error) {
      res.status(500).send('Error fetching metrics');
    }
  }
}
