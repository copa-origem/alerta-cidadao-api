import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest();

        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Token not given');
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);

            if (!decodedToken.email) {
                throw new UnauthorizedException("invalid token: email not found")
            }

            const user = await this.prisma.user.upsert({
                where: { id: decodedToken.uid },
                update: {
                    name: decodedToken.name,
                },
                create: {
                    id: decodedToken.uid,
                    email: decodedToken.email,
                    name: decodedToken.name,
                },
            });

            request['user'] = user;

            return true;
        } catch (error) {
            throw new UnauthorizedException('invalid token or expired');
        }
    }
}