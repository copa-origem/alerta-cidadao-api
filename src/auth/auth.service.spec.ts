import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { UnauthorizedException, ExecutionContext} from '@nestjs/common';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn(),
  }),
}));



describe('AuthGuard', () => {
  let guard: AuthGuard;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: {
        authorization: authHeader,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    const context = createMockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token not given'),
    );
  });

  it('should throw UnauthorizedException if token type is not Bearer', async () => {
    const context = createMockContext('Basic token123');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token not given'),
    );
  });

  it('should throw UnauthorizedException if firebase token verification fails', async () => {
    const context = createMockContext('Bearer invalid-token');

    (admin.auth().verifyIdToken as jest.Mock).mockResolvedValue(new Error('Firebase error'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('invalid token or expired'),
    );
  });

  it('should throw UnauthorizedException if decoded token has no email', async () => {
    const context = createMockContext('Bearer valid-token');

    (admin.auth().verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-123',
      name: 'Test User',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('invalid token or expired'),
    );
  });

  it('should upsert user and return true if token is valid', async () => {
    const context = createMockContext('Bearer valid-token');
    const request = context.switchToHttp().getRequest();

    const decodedToken = {
      uid: 'firebase-uid',
      email: 'test@example.com',
      name: 'Test User',
    };

    const dbUser = {
      id: 'firebase-uid',
      email: 'test@example.com',
      name: 'Test User',
    };

    (admin.auth().verifyIdToken as jest.Mock).mockResolvedValue(decodedToken);

    prismaMock.user.upsert.mockResolvedValue(dbUser as any);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { id: decodedToken.uid },
      update: { name: decodedToken.name },
      create: {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      },
    });
    expect(request['user']).toEqual(dbUser);
  });
});
