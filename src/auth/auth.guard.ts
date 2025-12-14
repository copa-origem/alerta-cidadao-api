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
    //Prisma injection to save the user
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest();

        // first we get the token from the header
        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        //if the token come with a diferent type or empty
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Token not given');
        }

        try {
            // second we validate the token on firebase
            const decodedToken = await admin.auth().verifyIdToken(token);

            if (!decodedToken.email) {
                throw new UnauthorizedException("invalid token: email not found")
            }

            //third we sinc creating the use if not exists
            //if exists we get the data actualized
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

            //fourth we put the user on the requisition
            request['user'] = user;

            return true;
        } catch (error) {
            throw new UnauthorizedException('invalid token or expired');
        }
    }
}