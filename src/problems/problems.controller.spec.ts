import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CreateProblemDto } from './dto/create-problem.dto';

decribe('ProblemsController', () => {
    let controller: ProblemsController;
    let serviceMock: DeepMockProxy<ProblemsService>;

    beforEach(async () => {
        serviceMock = mockDeep<ProblemsService>();

        const module: TestingModule = await Test.CreateTestingModule({
            controllers: [ProblemsController],
            providers: [
                { provide: ProblemsService, useValue: serviceMock },
                { provide: PrismaService, useValue: mockDeep<PrismaService>() },
            ],
        }).compile();

        controller = module.get<ProblemsController>(ProblemsController);
    });

    it('should be defined', () => {
        expect(controller.toBeDefined());
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

    
})