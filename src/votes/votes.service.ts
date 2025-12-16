import { ConflictException, Injectable } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { VoteType } from '@prisma/client';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createVoteDto: CreateVoteDto) {
    const { problemId, type } = createVoteDto;

    const existingVote = await this.prisma.vote.findUnique({
      where: {
        userId_problemId: {
          userId: userId,
          problemId: problemId,
        },
      },
    });

    if (existingVote) {
      throw new ConflictException("You already voted in this problem.");
    }

    return await this.prisma.$transaction(async (tx) => {

      const newVote = await tx.vote.create({
        data: {
          userId,
          problemId,
          type,
        },
      });

      if (type === VoteType.NON_EXISTENT) {
        const updatedProblem = await tx.problem.update({
          where: { id: problemId },
          data: {
            votesNotExistsCount: {
              increment: 1,
            },
          },
        });

        if (updatedProblem.votesNotExistsCount >= 3) {
          await tx.problem.delete({
            where: { id: problemId },
          });

          return { message: "Problem deleted by excess of down votes"}
        }
      }

      return newVote;
    });
  }

}
