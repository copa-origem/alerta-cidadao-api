import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsService } from './problems.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

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

    it('must create a problem with image', async ()=> {
        const userId = 'user-123';
        const dto = {
            description: 'Street hole',
            latitude: 10,
            longitude: 20,
            issueTypeId: 'type-1',
            imageUrl: 'base64-big...',
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

        const result = await service.create(userId, dto);

        expect(cloudinaryMock.uploadBase64).toHaveBeenCalledWith(dto.imageUrl);

        expect(prismaMock.problem.create).toHaveBeenCalledWith({
            data: {
                description: dto.description,
                latitude: dto.latitude,
                longitude: dto.longitude,
                imageUrl: 'https://cloudinary.com/foto.jpg',
                issueType: { connect: { id: dto.issueTypeId } },
                author: { connect: { id: userId } },
            },
        });

        expect(result.imageUrl).toBe('https://cloudinary.com/foto.jpg');
    });
});