import { genPopulateQuery } from './genPopulateQuery';
import { IResponse } from '../../interface/IResponse';
import { IRouterCtx } from '../../interface/IRouterCtx';
import { IController } from '../../interface/IController';
import { ModelPopulateOptions } from 'mongoose';

type params = {
  populate?: ModelPopulateOptions | Array<ModelPopulateOptions>
}

export function query(params: params = {}) {
  const { populate } = params;
  return function(target: IController, name: string, descriptor: PropertyDescriptor) {
    const func = descriptor.value;
    descriptor.value = async function(this: IController) {
      const ctx: IRouterCtx = arguments[0];
      const query = await func.apply(this, arguments);
      const data = await genPopulateQuery(this.Model.findOne(query), populate).exec();
      if (!data) {
        throw { status: 404, message: '资源不存在' }
      }
      const response: IResponse = {
        success: true,
        data,
      }
      ctx.status = 200;
      ctx.body = response;
    }
  }
}
