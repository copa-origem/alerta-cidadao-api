import { CanActivate, Controller, ExecutionContext, Get, INestApplication, Injectable, Req, UseGuards } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { HttpCacheInterceptor } from './http-cache.interceptor';
const request = require('supertest');

@Injectable()
class FakeAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        req.user = { id: req.headers['x-user-id'] };
        return true;
    }
}

let publicCalls = 0;

@Controller()
class TestController {
    @Get('public')
    findPublic() {
        publicCalls++;
        return { calls: publicCalls };
    }

    @Get('private')
    @UseGuards(FakeAuthGuard)
    findPrivate(@Req() req) {
        return { userId: req.user.id };
    }
}

describe('HttpCacheInterceptor', () => {
    let app: INestApplication;

    beforeEach(async () => {
        publicCalls = 0;

        const moduleRef = await Test.createTestingModule({
            imports: [CacheModule.register()],
            controllers: [TestController],
            providers: [{ provide: APP_INTERCEPTOR, useClass: HttpCacheInterceptor }],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('should not share authenticated responses between users', async () => {
        await request(app.getHttpServer()).get('/private').set('x-user-id', 'user-a').expect(200, { userId: 'user-a' });

        await request(app.getHttpServer()).get('/private').set('x-user-id', 'user-b').expect(200, { userId: 'user-b' });
    });

    it('should still cache public responses', async () => {
        await request(app.getHttpServer()).get('/public').expect(200, { calls: 1 });

        const res = await request(app.getHttpServer()).get('/public').expect(200, { calls: 1 });
        expect(res.headers['x-cache']).toBe('HIT');
    });
});
