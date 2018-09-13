import { createToken } from './../../utils/jwt';
import { IRouterCtx } from '../../interface/IRouterCtx';
import * as request from 'superagent';
import { config } from '../../config';
import { UserModel } from './user.model';
import { omit } from 'lodash';
import { throwCommonError, responseSuccess, throwNotFound } from '../../utils/handle-response';
import { MongoError } from 'mongodb';

export async function loginByOpenId(openId: string) {
  const query = { _openId: openId };
  let user = await UserModel.findOne(query).exec();
  if (!user) {
    try {
      user = await new UserModel(query).save();
    } catch(e) {
      const err = e as MongoError;
      if (err.code === 11000) {
        // 用户已创建(并发)
        user = await UserModel.findOne(query).exec();
      } else {
        throw err;
      }
    }
  }
  const token = await createToken({ id: user._id });
  return {
    user,
    token
  };
}

export async function login(ctx: IRouterCtx) {
  const { code } = ctx.request.body as any;
  try {
    const res = await request
      .get('https://api.weixin.qq.com/sns/jscode2session')
      .set('Content-Type', 'application/json')
      .query({
        appid: config.appid,
        secret: config.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      });
    const { errcode, errmsg, openid } = JSON.parse(res.text);
    if (errcode) {
      return throwCommonError(errmsg);
    }
    const { token, user } = await loginByOpenId(openid);
    responseSuccess(ctx, { data: { token, user } });
  } catch (e) {
    throw { status: 500, message: e.message || '微信登录错误' }
  }
}

export async function show(ctx: IRouterCtx) {
  const { id } = ctx.user;
  const user = await UserModel
    .findById(id)
    .populate({ path: 'currentBook' })
    .exec();
  if (!user) {
    throwNotFound();
  }
  responseSuccess(ctx, { data: user });
}

export async function update(ctx: IRouterCtx) {
  const { id } = ctx.user;
  const body = omit(ctx.request.body, ['_openId', '_id', 'create_at', 'update_at']);
  const user = await UserModel
    .findByIdAndUpdate(id, body, { new: true, runValidators: true })
    .populate({ path: 'currentBook' })
    .exec();
  if (!user) {
    throwNotFound();
  }
  responseSuccess(ctx, { data: user });
}
