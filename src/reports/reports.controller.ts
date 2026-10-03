import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { ReportJob } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExportReportDto } from './dto/export-problems.dto';
import type { User } from '@prisma/client';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly notificationsGateway: NotificationsGateway,
    ) {}

    @Post('export')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Trigger background PDF generation',
        description: `
        **Asynchronous Operation:**
        This endpoint pushes a message to the **RabbitMQ** queue and returns immediately.
        
        **How to get the result:**
        1. Client receives HTTP 202 (Accepted).
        2. Client should listen to the WebSocket event **"report_ready"**.
        3. Once the Worker finishes processing, the PDF URL will be pushed via WebSocket.
        `
    })
    @ApiResponse({ 
        status: 202, 
        description: 'Task accepted and queued for processing.',
        schema: {
            example: {
                message: 'Processing...',
                jobId: '14d61000-ff34-48ea-86a1-c1dd684005d0',
                status: 'pending'
            }
        }
    })
    @HttpCode(HttpStatus.ACCEPTED)
    @Throttle({ default: { limit: 2, ttl: 60000 } })
    async exportReport(@CurrentUser() user: User, @Body() body: ExportReportDto) {
        return this.reportsService.requestReport(user.id, body.filters);
    }

    @EventPattern('generate-report')
    async handleGenerateReport(@Payload() data: ReportJob) {
        const { userId, filters, jobId } = data;

        const pdfUrl = await this.reportsService.generatePdf(jobId, filters);

        this.notificationsGateway.notifyUser(userId, 'report_ready', {
            message: 'Seu relatório está pronto!',
            downloadUrl: pdfUrl,
            jobId: jobId
        });
    }
}
