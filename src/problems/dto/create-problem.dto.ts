import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, IsUUID, IsUrl } from 'class-validator';

export class CreateProblemDto {
    @ApiProperty({
        description: 'the detailed description from the problem.',
        example: 'Deep hole on the street, danger for motorcycle.',
    })
    @IsString()
    description: string;

    @ApiProperty({ example: -23.550520, description: 'Latitude of location'})
    @IsNumber()
    latitude: number;

    @ApiProperty({ example: -46.633308, description: 'Longitude of location'})
    @IsNumber()
    longitude: number;

    @ApiProperty({
        description: 'UUID from the type of the problem.',
        example: 'cc6b4a21-9a9f-43eb-aa93-c90d82e79677',
    })
    @IsUUID()
    issueTypeId: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}
