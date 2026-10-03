import {
    OnGatewayConnection,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    private logger = new Logger(NotificationsGateway.name);

    async handleConnection(client: Socket) {
        const token = this.extractToken(client);

        if (!token) {
            this.logger.warn(`Client ${client.id} disconnected: missing token.`);
            client.disconnect();
            return;
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);

            if (!decodedToken.uid) {
                throw new Error('UID not found.');
            }

            const userId = decodedToken.uid;

            const userRoom = `user_${userId}`;
            client.join(userRoom);

            client.data.user = { id: userId, email: decodedToken.email };

            this.logger.log(`Socket Connected: ${userId} on room ${userRoom}`);
        } catch (e) {
            this.logger.error(`Socket authentication failed: ${e.message}`);
            client.disconnect();
        }
    }

    notifyUser(userId: string, event: string, payload: unknown) {
        this.server.to(`user_${userId}`).emit(event, payload);
        this.logger.log(`Sent event '${event}' to user_${userId}`);
    }

    notifyAll(event: string, payload: unknown) {
        this.server.emit(event, payload);
    }

    private extractToken(client: Socket): string | undefined {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader) {
            const [type, token] = authHeader.split(' ');
            if (type === 'Bearer') return token;
        }

        const queryToken = client.handshake.query.token;
        if (typeof queryToken === 'string') return queryToken;

        const authObjToken = client.handshake.auth?.token;
        if(authObjToken) return authObjToken;

        return undefined;
    }
}