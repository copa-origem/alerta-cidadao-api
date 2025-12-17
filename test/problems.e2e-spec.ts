import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Problems Controller (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(new ValidationPipe());

        await app.init();

        prismaService = app.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await app.close();
    });

    it('/problems (POST) -> Must fail without Token', () => {
        return request(app.getHttpServer())
            .post('/problems')
            .send({
                description: 'Test E2E',
                latitude: 10,
                longitude: 10,
                issueTypeId: 'uuid-any'
            })
            .expect(401);
    });

    it('/problems (POST) -> Must fail with invalid values (ValidationPipe)', () => {
        return request(app.getHttpServer())
            .post('/problems')
            .send({
                description: 'Validation Test',
                latitude: 'this is not a number',
                longitude: 10,
                issueTypeId: 'uuid-any'
            })
            .expect(401);
    });
});