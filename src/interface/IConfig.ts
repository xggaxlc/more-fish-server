import { ConnectionOptions } from 'mongoose';

export interface IConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  ip: string;
  mongo: {
    uri: string;
    options: ConnectionOptions;
  },
  appid: string;
  appSecret: string;
  jwtSecret: string;
  jwtExpires: string;
  pagination: {
    limit: number;
  },
  tz: string;
  locale: string;
}
