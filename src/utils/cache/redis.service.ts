import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { createClient, RedisClientType } from 'redis';

dotenv.config({ path: '../../../.env' });

@Injectable()
export class RedisService {
	private client: RedisClientType;

	constructor() {
		this.doConnect();

		this.client.on('error', err => {
			console.error('Redis Client Error', err);
		});
	}

	doConnect() {
		this.client = createClient({ url: `${process.env.REDIS_URL}` });

		console.log('REDIS CONNECTION SUCCESS');

		this.client.connect();
	}

	async getValueFromCache(key: string) {
		return this.client.get(key);
	}

	async setValueToCache(key: string, value: string) {
		return this.client.set(key, value);
	}

	async deleteValueFromCache(key: string) {
		return this.client.del(key);
	}
}
