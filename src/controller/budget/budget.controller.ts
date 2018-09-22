import { BillModel } from './../bill/bill.model';
import { pick } from 'lodash';
import { BudgetModel, IBudgetModel } from './budget.model';
import { IRouterCtx } from './../../interface/IRouterCtx';
import { responseSuccess, throwNotFound } from '../../utils/handle-response';
import * as moment from 'moment';

export function queryBudget(
  bookId: string,
  year = moment().get('year'),
  month = moment().get('month')
) {

  const $time = moment().set('year', year).set('month', month);
  const $startAt = $time.clone().startOf('month');
  const $endAt = $time.clone().endOf('month');

  const query = {
    book: bookId,
    start_at: $startAt.toDate(),
    end_at: $endAt.toDate()
  }
  return BudgetModel
    .find(query)
    .exec();
}

export function createBudget(bookId: string, createBody: IBudgetModel) {
  const body: IBudgetModel = pick(createBody, ['name', 'remark', 'amount', 'color']) as IBudgetModel;
  body.book = bookId;
  body.start_at = moment().startOf('month').toDate();
  body.end_at = moment().endOf('month').toDate();
  return new BudgetModel(body).save();
}

export async function index(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const { year, month } = ctx.query;

  const data = await queryBudget(bookId, year, month);
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
  const budget = await createBudget(book._id, body);
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
  responseSuccess(ctx);
  BillModel.updateMany({ budget: id }, { budget: null });
}
