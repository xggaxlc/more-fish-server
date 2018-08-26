import { BudgetModel } from './../model/budget';
import autobind from 'autobind-decorator';
import { IRouterCtx } from '../interface/IRouterCtx';
import { IController } from '../interface/IController';
import { pick } from 'lodash';
import {
  query,
  queryWithPagination,
  create,
  update,
  destory
} from './helper';

@autobind
class BudgetController implements IController {

  Model = BudgetModel;

  @queryWithPagination()
  index(ctx: IRouterCtx) {
    const { name } = ctx.query;
    const query: { name?: any } = {};
    if (name) {
      query.name = { $regex: name };
    }
    return query;
  }

  @query({ populate: { path: 'period' } })
  show(ctx: IRouterCtx) {
    const query =  { _id: ctx.params.id };
    return query;
  }

  @create()
  create(ctx: IRouterCtx) {
    return ctx.request.body;
  }

  @update()
  update(ctx: IRouterCtx) {
    const { id } = ctx.params;
    return { id, body: pick(ctx.request.body, ['name', 'remark', 'amount', 'color']) };
  }

  @destory()
  destory(ctx: IRouterCtx) {
    return ctx.params.id;
  }
}

export const budgetController = new BudgetController();
