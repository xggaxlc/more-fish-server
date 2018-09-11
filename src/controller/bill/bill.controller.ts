import { pick } from 'lodash';
import { BillModel } from './bill.model';
import { IRouterCtx } from '../../interface/IRouterCtx';
import { responseSuccess, throwNotFound, getPaginationMeta } from '../../utils/handle-response';
import * as moment from 'moment';

export async function index(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const startAtDefault = moment().startOf('month').toDate();
  const endAtDefault = moment().endOf('month').toDate();
  const { start_at, end_at } = ctx.query;
  const startAt = start_at ? moment(start_at).toDate() : startAtDefault;
  const endAt = end_at ? moment(end_at).toDate() : endAtDefault;
  const query = {
    book: bookId,
    time: { $gte:startAt, $lte: endAt }
  };

  const { limit, skip } = ctx.pagination;
  const [data, count] = await Promise.all([
    BillModel
      .find(query)
      .sort({ time: -1 })
      .limit(limit)
      .skip(skip)
      .populate({ path: 'budget' })
      .populate({ path: 'create_user' })
      .exec(),
    BillModel.countDocuments(query)
  ]);
  const meta = getPaginationMeta(count, limit, skip);
  responseSuccess(ctx, { data, meta });
}

export async function show(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const data = await BillModel
    .findById(id)
    .populate({ path: 'budget' })
    .populate({ path: 'create_user' })
    .exec();
  if (!data) {
    throwNotFound();
  }
  responseSuccess(ctx, { data });
}

export async function create(ctx: IRouterCtx) {
  const body: any = pick(ctx.request.body, ['amount', 'time', 'remark', 'budget']);
  body.book = ctx.book._id;
  body.create_user = ctx.user.id;
  const { _id } = await new BillModel(body).save();
  const data = await BillModel
    .findById(_id)
    .populate({ path: 'budget' })
    .populate({ path: 'create_user' })
    .exec();
  responseSuccess(ctx, { data });
}

export async function update(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const body: any = pick(ctx.request.body, ['amount', 'time', 'remark', 'budget']);
  const data = await BillModel
    .findByIdAndUpdate(id, body, { new: true, runValidators: true })
    .populate({ path: 'budget' })
    .populate({ path: 'create_user' })
    .exec();
  if (!data) {
    throwNotFound();
  }
  responseSuccess(ctx, { data });
}

export async function destroy(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const data = await BillModel.findByIdAndRemove(id).exec();
  if (!data) {
    throwNotFound();
  }
  responseSuccess(ctx);
}
