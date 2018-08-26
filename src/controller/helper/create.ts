import { IResponse } from '../../interface/IResponse';
import { IRouterCtx } from '../../interface/IRouterCtx';
import { IController } from '../../interface/IController';

type params = {
  status: number
}

export function create(params: params = { status: 201 }) {
  return function(target: IController, name: string, descriptor: PropertyDescriptor) {
    const func = descriptor.value;
    descriptor.value = async function(this: IController) {
      const ctx: IRouterCtx = arguments[0];
      const body = await func.apply(this, arguments);
      const entity = new this.Model(body);
      const data = await entity.save();
      const response: IResponse = {
        success: true,
        data,
      }
      ctx.status = params.status;
      ctx.body = response;
    }
  }
}
