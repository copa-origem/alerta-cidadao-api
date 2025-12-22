import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsService } from './problems.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ProblemsService', () => {
    let service: ProblemsService;
    let prismaMock: DeepMockProxy<PrismaService>;
    let cloudinaryMock: DeepMockProxy<CloudinaryService>;

    beforeEach(async () => {
        prismaMock = mockDeep<PrismaService>();
        cloudinaryMock = mockDeep<CloudinaryService>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProblemsService,
                { provide: PrismaService, useValue: prismaMock},
                { provide: CloudinaryService, useValue: cloudinaryMock},
            ],
        }).compile();

        service = module.get<ProblemsService>(ProblemsService);
    });

    describe('create', () => {
        it('must create a problem with image', async () => {
            const userId = 'user-123';
            const dto = {
                description: 'Street hole',
                latitude: 10,
                longitude: 20,
                issueTypeId: 'type-1',
                imageUrl: 'base64-data',
            };

            cloudinaryMock.uploadBase64.mockResolvedValue('https://cloudinary.com/foto.jpg');
            prismaMock.problem.create.mockResolvedValue({
                id: 'prob-1',
                ...dto,
                imageUrl: 'https://cloudinary.com/foto.jpg',
                authorId: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                votesNotExistsCount: 0
            } as any);

            await service.create(userId, dto);

            expect(cloudinaryMock.uploadBase64).toHaveBeenCalledWith('base64-data');
            expect(prismaMock.problem.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ imageUrl: 'https://cloudinary.com/foto.jpg' })
            }));
        });

        it('must create a problem WITHOUT image', async () => {
            const userId = 'user-123';
            const dto = {
                description: 'No image here',
                latitude: 10,
                longitude: 20,
                issueTypeId: 'type-1',
                imageUrl: null,                
            };

            prismaMock.problem.create.mockResolvedValue({ id: 'prob-1' } as any);

            await service.create(userId, dto);

            expect(cloudinaryMock.uploadBase64).not.toHaveBeenCalled();
            expect(prismaMock.problem.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ imageUrl: ''})
            }));
        });
    });

    describe('findAll', () => {
        it('should return paginated problems', async () => {
            prismaMock.problem.findMany.mockResolvedValue([]);
            prismaMock.problem.count.mockResolvedValue(0);

            const result = await service.findAll(1, 10);

            expect(result).toHaveProperty('meta');
            expect(result.meta.page).toBe(1);
            expect(prismaMock.problem.findMany).toHaveBeenCalled();
        });
    });

    describe('findAllForMap', () => {
        it('should return problems with status OPEN', async () => {
            prismaMock.problem.findMany.mockResolvedValue([]);
            await service.findAllForMap();
            expect(prismaMock.problem.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { status: 'OPEN' }
            }));
        });
    });

    describe('findUserProblems', () => {
        it('should return problems for a specific user', async () => {
            const userId = 'user-1';
            prismaMock.problem.findMany.mockResolvedValue([]);
            await service.findUserProblems(userId);
            expect(prismaMock.problem.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { authorId: userId }
            }));
        });
    });

    describe('remove', () => {
        it('should throw NotFound if problem does not exist', async () => {
            prismaMock.problem.findUnique.mockResolvedValue(null);
            await expect(service.remove('id', 'user')).rejects.toThrow(NotFoundException);
        });

        it('should throw Forbidden if user is not the author', async () => {
            prismaMock.problem.findUnique.mockResolvedValue({ authorId: 'other-user' } as any);
            await expect(service.remove('id', 'my-user')).rejects.toThrow(ForbiddenException);
        });

        it('should delete if all checks pass', async () => {
            prismaMock.problem.findUnique.mockResolvedValue({ id: '1', authorId: 'user-1' } as any);
            prismaMock.problem.delete.mockResolvedValue({ id: '1' } as any);

            await service.remove('1', 'user-1');
            expect(prismaMock.problem.delete).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should throw NotFound if problem is not found or user is not author', async () => {
            prismaMock.problem.findUnique.mockResolvedValue(null);
            await expect(service.update('id', 'user')).rejects.toThrow(NotFoundException);
        });

        it('should update status to SOLVED', async () => {
            prismaMock.problem.findUnique.mockResolvedValue({ id: '1' } as any);
            prismaMock.problem.update.mockResolvedValue({ id: '1', status: 'SOLVED' } as any);

            await service.update('1', 'user-1');
            expect(prismaMock.problem.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { status: 'SOLVED' }
            }));
        });
    });

    describe('handleCronDeleteOldProblems', () => {
        it('should call deleteMany for old problems', async () => {
            prismaMock.problem.deleteMany.mockResolvedValue({ count: 5 } as any);
            await service.handleCronDeleteOldProblems();
            expect(prismaMock.problem.deleteMany).toHaveBeenCalled();
        });
    });
});