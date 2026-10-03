import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import type { ReportJob } from './reports.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsController', () => {
    let controller: ReportsController;
    let serviceMock: DeepMockProxy<ReportsService>;
    let gatewayMock: DeepMockProxy<NotificationsGateway>;

    const channel = { ack: jest.fn(), nack: jest.fn() };
    const message = { content: Buffer.from('') };
    const context = {
        getChannelRef: () => channel,
        getMessage: () => message,
    } as unknown as RmqContext;

    const job: ReportJob = {
        jobId: 'job-1',
        userId: 'user-1',
        filters: { status: 'OPEN' },
        createdAt: new Date(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        serviceMock = mockDeep<ReportsService>();
        gatewayMock = mockDeep<NotificationsGateway>();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportsController],
            providers: [
                { provide: ReportsService, useValue: serviceMock },
                { provide: NotificationsGateway, useValue: gatewayMock },
                { provide: PrismaService, useValue: mockDeep<PrismaService>() },
            ],
        }).compile();

        controller = module.get<ReportsController>(ReportsController);
    });

    describe('handleGenerateReport', () => {
        it('should notify the user and ack the message when the PDF is generated', async () => {
            serviceMock.generatePdf.mockResolvedValue('data:application/pdf;base64,abc');

            await controller.handleGenerateReport(job, context);

            expect(serviceMock.generatePdf).toHaveBeenCalledWith('job-1', job.filters);
            expect(gatewayMock.notifyUser).toHaveBeenCalledWith('user-1', 'report_ready', expect.objectContaining({
                jobId: 'job-1',
                downloadUrl: 'data:application/pdf;base64,abc',
            }));
            expect(channel.ack).toHaveBeenCalledWith(message);
            expect(channel.nack).not.toHaveBeenCalled();
        });

        it('should notify the failure and nack without requeue when the PDF generation fails', async () => {
            serviceMock.generatePdf.mockRejectedValue(new Error('Invalid date'));

            await controller.handleGenerateReport(job, context);

            expect(gatewayMock.notifyUser).toHaveBeenCalledWith('user-1', 'report_failed', expect.objectContaining({
                jobId: 'job-1',
            }));
            expect(gatewayMock.notifyUser).not.toHaveBeenCalledWith('user-1', 'report_ready', expect.anything());
            expect(channel.nack).toHaveBeenCalledWith(message, false, false);
            expect(channel.ack).not.toHaveBeenCalled();
        });
    });
});
