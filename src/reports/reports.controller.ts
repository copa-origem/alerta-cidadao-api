import { 
    Controller, 
    Post, 
    Body, 
    Req, 
    UseGuards, 
    HttpCode, 
    HttpStatus,
    Inject, 
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { EventPattern, Payload, MessagePattern, Ctx, RmqContext } from '@nestjs/microservices';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly notificationsGateway: NotificationsGateway,
        @Inject('RABBITMQ_SERVICE') private readonly rabbitmqClient: any,
    ) {}

    @Post('export')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    async exportReport(@Req() req, @Body() body: any) {
        const userId = req.user.id;
        const filters = body.filters;

        return this.reportsService.requestReport(userId, filters);
    }

    @EventPattern('generate-report')
    async handleGenerateReport(@Payload() data: any, @Ctx() context: RmqContext) {
        console.log('Worker recebeu job:', data.jobId);

        const { userId, filters, jobId } = data;

        const pdfUrl = await this.reportsService.generatePdf(filters);

        console.log(`Warning the user ${userId}  by WebSocket...`);
        this.notificationsGateway.notifyUser(userId, 'report_ready', {
            message: 'Seu relatório está pronto!',
            downloadUrl: pdfUrl,
            jobId: jobId
        });
    }
}