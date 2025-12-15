import { IsEnum, IsUUID } from 'class-validator';
import { VoteType } from '@prisma/client';

export class CreateVoteDto {
    @IsUUID()
    problemId: string;

    @IsEnum(VoteType)
    type: VoteType;
}
