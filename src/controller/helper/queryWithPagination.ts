import { genPopulateQuery } from './genPopulateQuery';
import { IResponse } from './../../interface/IResponse';
import { IRouterCtx } from './../../interface/IRouterCtx';
import { IController } from './../../interface/IController';
import { ModelPopulateOptions } from 'mongoose';

type params = {
  populate?: ModelPopulateOptions | Array<ModelPopulateOptions>
}

export function queryWithPagination(params: params = {}) {
  const { populate } = params;
  return function(target: IController, name: string, descriptor: PropertyDescriptor) {
    const func = descriptor.value;
    descriptor.value = async function(this: IController) {
      const ctx: IRouterCtx = arguments[0];
      const { limit, skip } = ctx.pagination;
      const query = await func.apply(this, arguments);

      const [data, count] = await Promise.all([
        genPopulateQuery(this.Model.find(query).limit(limit).skip(skip), populate).exec(),
        this.Model.countDocuments(query)
      ]);
      const response: IResponse = {
        success: true,
        data,
        meta: {
          count,
          limit,
          page: Math.floor(skip / limit) + 1
        }
      }
      ctx.status = 200;
      ctx.body = response;
    }
  }
}
