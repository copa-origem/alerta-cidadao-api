import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('reports')
export class ReportsController {
    constructor(private readonly ReportsService: ReportsService) {}

    @Post('export')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    async exportReport(@Req() req, @Body() body: any) {
        const userId = req.user.id;
        const filters = body.filters;

        return this.ReportsService.requestReport(userId, filters);
    }
}