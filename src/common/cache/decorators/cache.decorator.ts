import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

export const CacheKey = (key: string): CustomDecorator =>
  SetMetadata(CACHE_KEY_METADATA, key);

export const CacheTTL = (ttl: number): CustomDecorator =>
  SetMetadata(CACHE_TTL_METADATA, ttl);
