import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {

    prismaMock = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('must return a list of categories', async () => {
    const fakeCategories = [
      { id: '1', name: 'Holes', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'light', createdAt: new Date(), updatedAt: new Date() },
    ];

    prismaMock.category.findMany.mockResolvedValue(fakeCategories as any);

    const result = await service.findAll();

    expect(result).toEqual(fakeCategories);

    expect(prismaMock.category.findMany).toHaveBeenCalledTimes(1);

    expect(prismaMock.category.findMany).toHaveBeenCalledWith({
      include: { issueTypes: true },
    });
  });

  it('must return categories filtered by name', async () => {
    const categoryName = 'Holes';
    const fakeCategories = [
      { id: '1', name: 'Holes', createdAt: new Date(), updatedAt: new Date() },
    ];

    prismaMock.category.findMany.mockResolvedValue(fakeCategories as any);

    const result = await service.findByName(categoryName);

    expect(result).toEqual(fakeCategories);
    expect(prismaMock.category.findMany).toHaveBeenCalledWith({
      where: {
        name: categoryName,
      },
      include: {
        issueTypes: true,
      },
    });
  });
});
