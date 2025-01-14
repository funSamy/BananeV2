import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getOverview(query);
  }

  @Get('monthly-trends')
  getMonthlyTrends(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getMonthlyTrends(query);
  }

  @Get('expenditure-breakdown')
  getExpenditureBreakdown(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getExpenditureBreakdown(query);
  }
}
