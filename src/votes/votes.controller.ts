import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Votes')
@ApiBearerAuth()
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new vote on the problem'})
  @ApiResponse({ status: 201, description: 'vote created with success.'})
  @ApiResponse({ status: 401, description: 'Unauthorized request'})
  @ApiResponse({ status: 400, description: 'problemId must be a UUID'})
  @ApiResponse({ status: 400, description: 'Type must be CONFIRMATION or NON_EXISTENT'})
  @ApiResponse({ status: 409, description: 'You already voted on this problem.'})
  create(@Body() createVoteDto: CreateVoteDto, @Req() req) {
    const userId = req.user.id;
    return this.votesService.create(userId, createVoteDto);
  }

}
