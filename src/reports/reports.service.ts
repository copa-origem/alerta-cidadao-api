import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReportFiltersDto } from './dto/export-problems.dto';
const PDFDocument = require('pdfkit');

export interface ReportJob {
    jobId: string;
    userId: string;
    filters?: ReportFiltersDto;
    createdAt: Date;
}

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
        private readonly prisma: PrismaService,
    ) {}

    async requestReport(userId: string, filters?: ReportFiltersDto) {
        const jobId = crypto.randomUUID();
        const payload: ReportJob = { jobId, userId, filters, createdAt: new Date() };
        this.client.emit('generate-report', payload);
        return { message: 'Processing...', jobId, status: 'pending' };
    }

    async generatePdf(jobId: string, filters?: ReportFiltersDto): Promise<string> {
        this.logger.log(`Job ${jobId}: fetching problems`);

        const whereClause: Prisma.ProblemWhereInput = {};

        if (filters?.status) {
            whereClause.status = filters.status as Prisma.ProblemWhereInput['status'];
        }

        if (filters?.categoryId) {
            whereClause.issueType = {
                categoryId: filters.categoryId
            };
        }

        if (filters?.startDate && filters?.endDate) {
            whereClause.createdAt = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        const problems = await this.prisma.problem.findMany({
            where: whereClause,
            include: {
                issueType: {
                    include: {category: true}
                },
                author: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        this.logger.log(`Job ${jobId}: found ${problems.length} problems, generating PDF`);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => {
                const result = Buffer.concat(chunks);
                const base64Pdf = `data:application/pdf;base64,${result.toString('base64')}`;
                resolve(base64Pdf);
            });
            doc.on('error', (err: Error) => reject(err));

            doc.fontSize(20).text('Relatório de Problemas Urbanos', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();
            
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            if (problems.length === 0) {
                doc.fontSize(14).text('Nenhum registro encontrado para os filtros selecionados.', { align: 'center' });
            } else {
                problems.forEach((problem, index) => {
                    if (doc.y > 700) doc.addPage();

                    doc.fontSize(14).font('Helvetica-Bold')
                       .text(`#${index + 1} - ${problem.issueType.title} (${problem.issueType.category.name})`);
                    
                    doc.fontSize(10).font('Helvetica').fillColor('black');
                    doc.text(`Status: ${problem.status}`);
                    doc.text(`Data: ${problem.createdAt.toLocaleDateString()}`);
                    doc.text(`Autor: ${problem.author.name || 'Anônimo'}`);
                    
                    doc.moveDown(0.5);
                    doc.font('Helvetica-Oblique').text(`" ${problem.description} "`, { width: 400 });
                    
                    if (problem.imageUrl) {
                        doc.fillColor('blue').text('Ver foto original', { link: problem.imageUrl, underline: true });
                    }

                    doc.fillColor('black');
                    doc.moveDown();
                    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
                    doc.moveDown();
                });
            }

            doc.end();
        });
    }
}