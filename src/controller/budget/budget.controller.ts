import { pick } from 'lodash';
import { BudgetModel, IBudgetModel } from './budget.model';
import { IRouterCtx } from './../../interface/IRouterCtx';
import { responseSuccess, throwNotFound } from '../../utils/handle-response';
import * as moment from 'moment';

export async function index(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const {
    start_at = moment().startOf('month').toDate(),
    end_at =  moment().endOf('month').toDate()
  } = ctx.query;
  const query = {
    book: bookId,
    start_at,
    end_at
  }
  const data = await BudgetModel
    .find(query)
    .exec();
  responseSuccess(ctx, { data });
}

export async function show(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const data = await BudgetModel
    .findById(id)
    .populate({ path: 'book' })
    .exec();
  if (!data) {
    throwNotFound();
  }
  responseSuccess(ctx, { data });
}

export async function create(ctx: IRouterCtx) {
  const book = ctx.book;
  const body: IBudgetModel = pick(ctx.request.body, ['name', 'remark', 'amount', 'color']) as IBudgetModel;
  body.book = book._id;
  body.start_at = moment().startOf('month').toDate();
  body.end_at = moment().endOf('month').toDate();
  const budget = await new BudgetModel(body).save();
  responseSuccess(ctx, { data: budget });
}

export async function update(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const body = pick(ctx.request.body, ['name', 'remark', 'amount', 'color']);
  const data = await BudgetModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }).exec();
  if (!data) {
    throwNotFound();
  }
  responseSuccess(ctx, { data });
}

export async function destroy(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const data = await BudgetModel.findByIdAndRemove(id).exec();
  if (!data) {
    throwNotFound();
  }
  responseSuccess(ctx, {}, 204);
}
