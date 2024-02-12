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

	public get getClient(): RedisClientType {
		return this.client;
	}
}
