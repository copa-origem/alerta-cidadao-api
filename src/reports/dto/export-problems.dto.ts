import { ApiProperty } from '@nestjs/swagger';

export class ExportReportDto {
  @ApiProperty({
    description: 'Filtros aplicados para a geração do relatório',
    example: {
      status: 'PENDENTE',
      category: 'Buracos',
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-31'
      }
    },
  })
  filters: any; 
}