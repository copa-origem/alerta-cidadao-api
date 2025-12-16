import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsUUID } from 'class-validator';
import { VoteType } from '@prisma/client';

export class CreateVoteDto {
    @ApiProperty({
        description: 'UUID from the problem on database.',
        example: 'f931f4533-c284320a-8c09-5a013242fb55a526.',
    })
    @IsUUID()
    problemId: string;
    @ApiProperty({ enum: VoteType })
    @IsEnum(VoteType)
    type: VoteType;
}
