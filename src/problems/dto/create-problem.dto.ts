import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateProblemDto {
    @ApiProperty({
        description: 'The detailed description of the problem.',
        example: 'Deep pothole on the street, dangerous for motorcycles.',
    })
    @IsString()
    description: string;

    @ApiProperty({ example: -23.550520, description: 'Latitude of the location'})
    @IsNumber()
    latitude: number;

    @ApiProperty({ example: -46.633308, description: 'Longitude of the location'})
    @IsNumber()
    longitude: number;

    @ApiProperty({
        description: 'UUID of the problem type.',
        example: 'cc6b4a21-9a9f-43eb-aa93-c90d82e79677',
    })
    @IsUUID()
    issueTypeId: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}
