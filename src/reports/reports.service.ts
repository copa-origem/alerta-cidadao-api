import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ReportsService {
    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    ) {}

    async requestReport(userId: string, filters: any) {
        const jobId = crypto.randomUUID();

        const payload = {
            jobId,
            userId,
            filters,
            createdAt: new Date(),
        };

        this.client.emit('generate-report', payload);

        return {
            message: 'Solicitation recived. We gonna say when is ready',
            jobId,
            status: 'pending'
        };
    }
}