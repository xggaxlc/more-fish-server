import { pick } from 'lodash';
import { BillModel } from './bill.model';
import { IRouterCtx } from '../../interface/IRouterCtx';
import { responseSuccess, throwNotFound, getPaginationMeta } from '../../utils/handle-response';

export async function index(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const query = { book: bookId };
  const { limit, skip } = ctx.pagination;
  const [data, count] = await Promise.all([
    BillModel
      .find(query)
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
  responseSuccess(ctx, {}, 204);
}
