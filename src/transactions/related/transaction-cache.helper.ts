import { Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { RedisService } from '../../utils/cache/redis.service';

@Injectable()
export class TransactionRedisHelper {
	client: RedisClientType;

	constructor(private redis: RedisService) {
		this.client = this.redis.getClient;
	}

	async getTransactionsFromCache(key: string) {
		return this.client.get(key);
	}

	async setTransactionsToCache(key: string, value: string) {
		return this.client.set(key, value);
	}

	async setTransactionsToCacheWithTTL(key: string, value: string, ttlInSec: number) {
		return this.client.set(key, value, { EX: ttlInSec });
	}

	async deleteTransactionsFromCache(key: string) {
		return this.client.del(key);
	}

	async resetAllCachedLists(user_id: number, category_id: number) {
		await this.deleteTransactionsFromCache(`app:${user_id}:timerange:DAY`);
		await this.deleteTransactionsFromCache(`app:${user_id}:timerange:WEEK`);
		await this.deleteTransactionsFromCache(`app:${user_id}:timerange:MONTH`);

		await this.deleteTransactionsFromCache(`app:${user_id}:category:${category_id}`);
	}
}
