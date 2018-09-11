import { BillModel } from './../bill/bill.model';
import { pick } from 'lodash';
import { BudgetModel, IBudgetModel } from './budget.model';
import { IRouterCtx } from './../../interface/IRouterCtx';
import { responseSuccess, throwNotFound } from '../../utils/handle-response';
import * as moment from 'moment';

function queryBudget(bookId: string, start_at: Date, end_at: Date) {
  const query = {
    book: bookId,
    start_at,
    end_at
  }
  return BudgetModel
    .find(query)
    .exec();
}

function createBudget(bookId: string, createBody: IBudgetModel) {
  const body: IBudgetModel = pick(createBody, ['name', 'remark', 'amount', 'color']) as IBudgetModel;
  body.book = bookId;
  body.start_at = moment().startOf('month').toDate();
  body.end_at = moment().endOf('month').toDate();
  return new BudgetModel(body).save();
}

export async function index(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const data = await queryBudget(
    bookId,
    moment().startOf('month').toDate(),
    moment().endOf('month').toDate()
  );

  if (data.length) {
    responseSuccess(ctx, { data });
  } else {
    const lastMonth = moment().startOf('month').add(-1, 'days');
    const lastMonthData = await queryBudget(
      bookId,
      lastMonth.startOf('month').toDate(),
      lastMonth.endOf('month').toDate()
    );
    const createdData = await Promise.all(lastMonthData.map(item => createBudget(bookId, item)));
    responseSuccess(ctx, { data: createdData });
  }
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
  responseSuccess(ctx, {}, 204);
  BillModel.updateMany({ budget: id }, { budget: null });
}
