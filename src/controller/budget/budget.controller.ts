import { pick } from 'lodash';
import { BudgetModel } from './budget.model';
import { IRouterCtx } from './../../interface/IRouterCtx';
import { responseSuccess, throwNotFound } from '../../utils/handle-response';

export async function index(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const data = BudgetModel.find({ book: bookId }).exec();
  responseSuccess(ctx, { data });
}

export async function show(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const data = BudgetModel
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
  const body: any = pick(ctx.request.body, ['name', 'remark', 'amount', 'color']);
  body.book = book._id;
  const budget = new BudgetModel(body).save();
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
