import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportFiltersDto {
    @ApiProperty({ example: 'OPEN', description: "Problem status to report", required: false})
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty({ example: 'cc6b4a21-9a9f-43eb-aa93-c90d82e79677', description: "Category id", required: false})
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiProperty({ example: '2025-12-01', description: "Start date of the report", required: false})
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiProperty({ example: '2026-01-01', description: "End date of the report", required: false})
    @IsOptional()
    @IsString()
    endDate?: string;
}

export class ExportReportDto {
    @ApiProperty({ type: ReportFiltersDto })
    @ValidateNested()
    @Type(() => ReportFiltersDto)
    filters: ReportFiltersDto;
}