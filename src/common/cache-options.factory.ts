import { Logger } from '@nestjs/common';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import KeyvRedis, { createClient } from '@keyv/redis';
import Keyv from 'keyv';

export const CACHE_TTL_MS = 60 * 1000;
export const CACHE_NAMESPACE = 'http-cache';

const logger = new Logger('Cache');

export function cacheOptionsFactory(config: ConfigService): CacheModuleOptions {
    const host = config.get<string>('REDIS_HOST', 'localhost');
    const port = config.get<number>('REDIS_PORT', 6379);

    const client = createClient({
        url: `redis://${host}:${port}`,
        disableOfflineQueue: true,
        socket: { reconnectStrategy: false, connectTimeout: 1000 },
    });
    const store = new KeyvRedis(client, { namespace: CACHE_NAMESPACE, throwOnConnectError: false });
    const keyv = new Keyv({ store, namespace: CACHE_NAMESPACE, useKeyPrefix: false });

    let available = true;
    client.on('ready', () => {
        if (!available) logger.log('Redis connection restored');
        available = true;
    });
    keyv.on('error', (error: Error) => {
        if (available) logger.warn(`Redis unavailable, skipping cache: ${error.message}`);
        available = false;
    });

    return {
        ttl: CACHE_TTL_MS,
        stores: [keyv],
    };
}
