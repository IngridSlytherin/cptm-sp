import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly client: Redis;
  constructor(config: ConfigService) { this.client = new Redis(config.getOrThrow<string>('REDIS_URL'), { lazyConnect:true, maxRetriesPerRequest:1, enableOfflineQueue:false }); }
  async ping(): Promise<boolean> { if (this.client.status === 'wait') await this.client.connect(); return (await this.client.ping()) === 'PONG'; }
  private async ready(): Promise<boolean> { try { return await this.ping(); } catch { return false; } }
  async get(key: string): Promise<string | null> { return await this.ready() ? this.client.get(key) : null; }
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!await this.ready()) return false;
    if (ttlSeconds) await this.client.set(key, value, 'EX', ttlSeconds); else await this.client.set(key, value);
    return true;
  }
  async acquireLock(key: string, value: string, ttlSeconds: number): Promise<boolean> { if (!await this.ready()) return false; return (await this.client.set(key,value,'EX',ttlSeconds,'NX')) === 'OK'; }
  async releaseLock(key: string, value: string): Promise<void> { if (!await this.ready()) return; await this.client.eval("if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end",1,key,value); }
  async onApplicationShutdown(): Promise<void> { if (this.client.status !== 'end') await this.client.quit(); }
}
