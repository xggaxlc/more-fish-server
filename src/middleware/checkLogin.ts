import { decodeToken } from './../utils/jwt';
import { IRouterCtx } from './../interface/IRouterCtx';
import { get } from 'lodash';

export const checkLogin = async(ctx: IRouterCtx, next: () => Promise<any>) => {
  const jwtToken = get(ctx, 'headers.authorization', '') || get(ctx, 'query.authorization', '');
  if (!jwtToken) {
    throw {
      status: 401,
      message: '请登录'
    }
  }
  ctx.user = await decodeToken(jwtToken);
  await next();
}
