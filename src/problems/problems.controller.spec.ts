import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CreateProblemDto } from './dto/create-problem.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { User } from '@prisma/client';

const mockNotificationsGateway = {
    notifyAll: jest.fn(),
};

describe('ProblemsController', () => {
    let controller: ProblemsController;
    let serviceMock: DeepMockProxy<ProblemsService>;
    let gateway: NotificationsGateway;

    const mockCacheManager = {
        clear: jest.fn(),
        store: {
            reset: jest.fn(),
        },
    };

    beforeEach(async () => {
        serviceMock = mockDeep<ProblemsService>();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProblemsController],
            providers: [
                { provide: ProblemsService, useValue: serviceMock },
                { provide: PrismaService, useValue: mockDeep<PrismaService>() },
                { provide: CACHE_MANAGER, useValue: mockCacheManager },
                { provide: NotificationsGateway, useValue: mockNotificationsGateway },
            ],
        }).compile();

        controller = module.get<ProblemsController>(ProblemsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('should create a problem and emit a websocket event', () => {
        it('should call service.create with correct data', async () => {
            const dto: CreateProblemDto = {
                description: 'Test problem',
                latitude: 1.23,
                longitude: 4.56,
                issueTypeId: 'type-1',
                imageUrl: 'base64str',
            };
            const user = { id: 'user-123' } as User;

            const createdProblemMock = {
                id: 'uuid-123',
                description: 'Test problem',
                latitude: 1.23,
                longitude: 4.56,
                imageUrl: 'base64str',
                issueTypeId: 'type-1',
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: 'user-123',
                issueType: { title: 'hole', id: 'type-1', categoryId: 'cat-1' },
                author: { id: 'user-123', name: 'User Test' },
                votesNotExistsCount: 0               
            }

            serviceMock.create.mockResolvedValue(createdProblemMock as any);

            await controller.create(dto, user);

            expect(serviceMock.create).toHaveBeenCalledWith('user-123', dto);

            expect(mockNotificationsGateway.notifyAll).toHaveBeenCalledWith(
                'map-update',
                expect.objectContaining({
                    id: 'uuid-123',
                    description: 'Test problem',
                    latitude: 1.23,
                    longitude: 4.56,
                    issueType: { id: 'type-1', title: 'hole' },
                    imageUrl: 'base64str',
                    votesNotExistsCount: 0
                })
            )
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
        it('should call service.findUserProblems with the current user id', async () => {
            const user = { id: 'user-456' } as User;
            await controller.findUserProblems(user);
            expect(serviceMock.findUserProblems).toHaveBeenCalledWith('user-456');
        });
    });

    describe('markAsSolved', () => {
        it('should call service.markAsSolved with problem id and user id', async () => {
            const user = { id: 'user-789' } as User;
            const problemId = 'prob-1';

            await controller.markAsSolved(problemId, user);

            expect(serviceMock.markAsSolved).toHaveBeenCalledWith(problemId, 'user-789');
        });
    });

    describe('remove', () => {
        it('should call service.remove with problem id and user id', async () => {
            const user = { id: 'user-999' } as User;
            const problemId = 'prob-delete';

            await controller.remove(problemId, user);

            expect(serviceMock.remove).toHaveBeenCalledWith(problemId, 'user-999');
        });
    });
});