import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
const PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService {
    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
        private readonly prisma: PrismaService,
    ) {}

    async requestReport(userId: string, filters: any) {
        const jobId = crypto.randomUUID();

        const payload = { jobId, userId, filters, createdAt: new Date() };

        this.client.emit('generate-report', payload);

        return { message: 'Processing...', jobId, status: 'pending' };
    }

    async generatePdf(filters: any): Promise<string> {
        console.log('Iniciando geração do pdf complexa...');

        return new Promise((resolve, reject) => {
            // 1. Cria o documento
            const doc = new PDFDocument();
            const chunks: any[] = [];

            // 2. Coleta os dados (Buffers)
            doc.on('data', (chunk) => chunks.push(chunk));
            
            doc.on('end', () => {
                const result = Buffer.concat(chunks);
                const base64Pdf = `data:application/pdf;base64,${result.toString('base64')}`;
                console.log('✅ PDF (PDFKit) Gerado com sucesso!');
                resolve(base64Pdf);
            });

            doc.on('error', (err) => reject(err));

            // 3. Desenha o conteúdo
            doc.fontSize(25).text('Relatório de Ocorrências', 100, 50);
            
            doc.moveDown();
            doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString()}`);
            
            doc.moveDown();
            doc.text('Filtros aplicados: ' + JSON.stringify(filters));

            doc.moveDown();
            doc.text('Lista de Ocorrências (Exemplo):');
            
            // Simula uma lista
            const denuncias = ['Buraco na rua', 'Luz queimada', 'Lixo acumulado'];
            denuncias.forEach((item, index) => {
                doc.text(`${index + 1}. ${item}`);
            });

            // 4. Finaliza
            doc.end();
        });
    }
}