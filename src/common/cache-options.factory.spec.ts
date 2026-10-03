import { ConfigService } from '@nestjs/config';
import KeyvRedis, { RedisClientType } from '@keyv/redis';
import Keyv from 'keyv';
import { cacheOptionsFactory, CACHE_NAMESPACE, CACHE_TTL_MS } from './cache-options.factory';

describe('cacheOptionsFactory', () => {
    const config = new ConfigService({ REDIS_HOST: 'redis', REDIS_PORT: 6380 });

    it('should set the ttl on the cache manager options', () => {
        const options = cacheOptionsFactory(config);

        expect(options.ttl).toBe(CACHE_TTL_MS);
    });

    it('should use a namespaced Redis store from the config', () => {
        const options = cacheOptionsFactory(config);
        const stores = options.stores as Keyv[];

        expect(stores).toHaveLength(1);
        expect(stores[0]).toBeInstanceOf(Keyv);
        expect(stores[0].namespace).toBe(CACHE_NAMESPACE);

        const adapter = stores[0].store as KeyvRedis<unknown>;
        expect(adapter).toBeInstanceOf(KeyvRedis);
        expect((adapter.client as RedisClientType).options?.url).toBe('redis://redis:6380');
    });

    it('should not block requests when Redis is unreachable', async () => {
        const unreachable = new ConfigService({ REDIS_HOST: 'localhost', REDIS_PORT: 1 });
        const [keyv] = cacheOptionsFactory(unreachable).stores as Keyv[];

        await keyv.set('key', 'value');

        expect(await keyv.get('key')).toBeUndefined();
    });
});
