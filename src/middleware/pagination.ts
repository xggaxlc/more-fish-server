import { IPagination } from './../interface/IPagination';
import { IRouterCtx } from './../interface/IRouterCtx';
import { config } from '../config';

export const pagination = async(ctx: IRouterCtx, next: () => Promise<any>) => {
  if (!ctx.pagination) {
    const query = ctx.query;
    const page = Math.max(1, +query.page || 1);
    const limit = Math.min(100, +query.limit || config.pagination.limit);
    const skip = (page - 1) * limit;
    const pagination: IPagination = {
      limit,
      skip
    }
    ctx.pagination = pagination;
  }
  await next();
}
