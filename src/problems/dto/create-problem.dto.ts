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
        example: 'f9bf4533-c28a-4a0a-8c09-5a01fb55a526.',
    })
    @IsUUID()
    issueTypeId: string;

    @ApiPropertyOptional({
        description: 'URL from image of the problem.',
        example: 'https://my-image.com/image.jpg',
    })
    @IsOptional()
    @IsString()
    imageUrl?: string;
}
