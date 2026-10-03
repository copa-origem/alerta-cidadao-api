import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsUUID } from 'class-validator';
import { VoteType } from '@prisma/client';

export class CreateVoteDto {
    @ApiProperty({
        description: 'UUID of the problem in the database.',
        example: 'f931f453-c284-420a-8c09-5a013242fb55',
    })
    @IsUUID()
    problemId: string;
    @ApiProperty({ enum: VoteType })
    @IsEnum(VoteType)
    type: VoteType;
}
