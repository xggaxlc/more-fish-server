import { BillModel } from './../model/bill';
import autobind from 'autobind-decorator';
import { IRouterCtx } from '../interface/IRouterCtx';
import { IController } from '../interface/IController';
import { pick, uniq } from 'lodash';
import {
  query,
  queryWithPagination,
  create,
  update,
  destory
} from './helper';

@autobind
class BillController implements IController {

  Model = BillModel;

  @queryWithPagination()
  index(ctx: IRouterCtx) {
    const { name } = ctx.query;
    const query: { name?: any } = {};
    if (name) {
      query.name = { $regex: name };
    }
    return query;
  }

  @query({ populate: [{ path: 'create_user' }, { path: 'users' }] })
  show(ctx: IRouterCtx) {
    const query =  { _id: ctx.params.id };
    return query;
  }

  @create()
  create(ctx: IRouterCtx) {
    const { remark, budget, period, book, users = [] } = ctx.request.body as any;
    const create_user = ctx.user.id;

    return {
      remark,
      budget,
      period,
      book,
      users: uniq([create_user].concat(users))
    }
  }

  @update()
  update(ctx: IRouterCtx) {
    const { id } = ctx.params;
    return { id, body: pick(ctx.request.body, ['remark', 'users']) };
  }

  @destory()
  destory(ctx: IRouterCtx) {
    return ctx.params.id;
  }
}

export const billController = new BillController();
