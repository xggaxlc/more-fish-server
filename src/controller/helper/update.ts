import { IResponse } from './../../interface/IResponse';
import { IRouterCtx } from './../../interface/IRouterCtx';
import { IController } from './../../interface/IController';

type params = {
  status: number
}

export function update(params: params = { status: 200 }) {
  return function(target: IController, name: string, descriptor: any) {
    const func = descriptor.value;
    descriptor.value = async function(this: IController) {
      const ctx: IRouterCtx = arguments[0];
      const { id, body } = await func.apply(this, arguments);
      const data = await this.Model.findByIdAndUpdate(id, body).exec();
      const response: IResponse = {
        success: true,
        data,
      }
      ctx.status = params.status;
      ctx.body = response;
    }
  }
}
