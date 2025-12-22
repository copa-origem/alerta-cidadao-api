import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CreateProblemDto } from './dto/create-problem.dto';

describe('ProblemsController', () => {
    let controller: ProblemsController;
    let serviceMock: DeepMockProxy<ProblemsService>;

    beforeEach(async () => {
        serviceMock = mockDeep<ProblemsService>();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProblemsController],
            providers: [
                { provide: ProblemsService, useValue: serviceMock },
                { provide: PrismaService, useValue: mockDeep<PrismaService>() },
            ],
        }).compile();

        controller = module.get<ProblemsController>(ProblemsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create with correct data', async () => {
            const dto: CreateProblemDto = {
                description: 'Test problem',
                latitude: 1.23,
                longitude: 4.56,
                issueTypeId: 'type-1',
                imageUrl: 'base64str',
            };
            const req = { user: { id: 'user-123' } };

            await controller.create(dto, req);

            expect(serviceMock.create).toHaveBeenCalledWith('user-123', dto);
        });
    });

    describe('findAllForMap', () => {
        it('should call service.findAllForMap', async () => {
            await controller.findAllForMap();
            expect(serviceMock.findAllForMap).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should call service.findAll with default or provided values', async () => {
            await controller.findAll(2, 20);
            expect(serviceMock.findAll).toHaveBeenCalledWith(2, 20);
        });
    });

    describe('findUserProblems', () => {
        it('should call service.findUserProblems with user id from request', async () => {
            const req = { user: { id: 'user-456' } };
            await controller.findUserProblems(req);
            expect(serviceMock.findUserProblems).toHaveBeenCalledWith('user-456');
        });
    });

    describe('updateStatus', () => {
        it('should call service.update with problem id and user id', async () => {
            const req = { user: { id: 'user-789' } };
            const problemId = 'prob-1';

            await controller.updateStatus(problemId, req);

            expect(serviceMock.update).toHaveBeenCalledWith(problemId, 'user-789');
        });
    });

    describe('remove', () => {
        it('should call service.remove with problem id and user id', async () => {
            const req = { user: { id: 'user-999' } };
            const problemId = 'prob-delete';

            await controller.remove(problemId, req);

            expect(serviceMock.remove).toHaveBeenCalledWith(problemId, 'user-999');
        });
    });
});