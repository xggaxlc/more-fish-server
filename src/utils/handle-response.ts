import { IRouterCtx } from "../interface/IRouterCtx";
import { IResponse } from "../interface/IResponse";
import * as moment from 'moment';

export function throwNotFound(message = '资源不存在') {
  throw { status: 404, message };
}

export function throwForbidden(message = '没有权限') {
  throw { status: 403, message };
}

export function throwCommonError(message: string) {
  throw { status: 400, message };
}

export function responseSuccess(ctx: IRouterCtx, body?: IResponse, status = 200) {
  ctx.set('Timestamp', Date.now().toString());
  ctx.body = Object.assign({}, body, { success: true });
  ctx.status = status;
}

export function getPaginationMeta(count: number, limit: number, skip: number) {
  return {
    count,
    limit,
    page: Math.floor(skip / limit) + 1
  }
}
