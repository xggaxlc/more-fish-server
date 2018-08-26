import { IResponse } from '../../interface/IResponse';
import { IRouterCtx } from '../../interface/IRouterCtx';
import { IController } from '../../interface/IController';

type params = {
  status: number
}

export function destory(params: params = { status: 204 }) {
  return function(target: IController, name: string, descriptor: any) {
    const func = descriptor.value;
    descriptor.value = async function(this: IController) {
      const ctx: IRouterCtx = arguments[0];
      const id = await func.apply(this, arguments);
      await this.Model.findOneAndRemove(id).exec();
      const response: IResponse = {
        success: true
      }
      ctx.status = params.status;
      ctx.body = response;
    }
  }
}
