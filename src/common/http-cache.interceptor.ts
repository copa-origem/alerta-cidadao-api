import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
    protected isRequestCacheable(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        if (request.user) {
            return false;
        }

        return super.isRequestCacheable(context);
    }
}
