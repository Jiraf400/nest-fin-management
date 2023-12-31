import { Injectable } from '@nestjs/common';
import config from 'config';

@Injectable()
export class ConfigService {
  private readonly env: string = process.env.NODE_ENV || 'development';

  get(key: string): any {
    console.log('Current environment:', this.env);
    return config.get(`${key}`);
  }
}
