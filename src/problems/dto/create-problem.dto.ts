import { IsString, IsNumber, IsOptional, IsUUID, IsUrl } from 'class-validator';

export class CreateProblemDto {
    @IsString()
    description: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsUUID()
    issueTypeId: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}
