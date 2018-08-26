import { UserModel } from '../model/user';
import { IRouterCtx } from '../interface/IRouterCtx';
import { IController } from '../interface/IController';
import autobind from 'autobind-decorator';
import { omit } from 'lodash';
import { IResponse } from '../interface/IResponse';
import * as request from 'superagent';
import { config } from '../config';

import {
  update,
  query
} from './helper';

@autobind
class UserController implements IController {

  Model = UserModel;

  @query()
  async show(ctx: IRouterCtx) {
    return { _id: ctx.user.id };
  }

  @update()
  update(ctx: IRouterCtx) {
    const { id } = ctx.user;
    const body = omit(ctx.request.body, ['_openId', '_id']);
    return { id, body };
  }
}

export const userController = new UserController();
