import { ApiProperty } from '@nestjs/swagger';

export class ExportReportDto {
  @ApiProperty({
    description: 'Filtros aplicados para a geração do relatório',
    example: {
      status: 'OPEN',
      categoryId: 'cc6b4a21-9a9f-43eb-aa93-c90d82e79677',
      startDate: '2025-12-01',
      endDate: '2026-01-01'
    },
  })
  filters: any; 
}