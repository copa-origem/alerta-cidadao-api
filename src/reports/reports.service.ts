import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
const PdfPrinter = require('pdfmake/src/printer');
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as fs from 'fs';

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

    async generatePdf(filters: any): Promise<string> {
        console.log('Iniciando geração do pdf complexa...');

        const denuncias = [
            { titulo: 'Buraco na rua x', data: '12/01/2026', status: 'Aberto'},
            { titulo: 'Luz do poste queimada', data: '11/01/2026', status: 'Resolvido'},
            { titulo: 'Lixo na calçada', data: '10/01/2026', status: 'Aberto'},
        ];

        const fonts = {
            Helvetica: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique',
            },
        };

        const printer = new PdfPrinter(fonts);

        const docDefinition: TDocumentDefinitions = {
            defaultStyle: { font: 'Helvetica' },
            content: [
                { text: 'Relatório de Ocorrências Urbanas', style: 'header'},
                { text: `Gerado em: ${new Date().toLocaleString()}`, style: 'subheader'},
                { text: '\n\n'},

                {
                    table: {
                        widths: ['*', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Ocorrência', style: 'tableHeader' },
                                { text: 'Data', style: 'tableHeader'},
                                { text: 'Status', style: 'tableHeader' }
                            ],
                            ...denuncias.map(d => [d.titulo, d.data, d.status])
                        ]
                    }
                }
            ],
            styles: {
                header: {fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
                subheader: {fontSize: 12, italics: true, alignment: 'center' },
                tableHeader: {bold: true, fontSize: 13, color: 'black', fillColor: '#eeeeee'}
            }
        };

        return new Promise((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: any[] = [];

            pdfDoc.on('data', (chunk) => chunks.push(chunk));

            pdfDoc.on('end', () => {
                const result = Buffer.concat(chunks);

                const base64Pdf = `data:application/pdf;base64,${result.toString('base64')}`;
                console.log('pdf real gerado');
                resolve(base64Pdf);
            });

            pdfDoc.on('error', (err) => {
                reject(err);
            });

            pdfDoc.end();
        });
    }
}