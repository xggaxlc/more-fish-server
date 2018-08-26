import { pick } from 'lodash';
import { BillModel } from './bill.model';
import { IRouterCtx } from '../../interface/IRouterCtx';
import { getPaginationMeta, responseSuccess, throwNotFound, throwCommonError } from '../helper/handle-response';

export async function index(ctx: IRouterCtx) {
  const { id } = ctx.user;
  const query: any = { users: id };
  const { limit, skip } = ctx.pagination;
  const [data, count] = await Promise.all([
    BillModel
      .find(query)
      .limit(limit)
      .skip(skip),
    BillModel.countDocuments(query)
  ]);
  const meta = getPaginationMeta(count, limit, skip);
  responseSuccess(ctx, { data, meta });
}

export async function show(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const data = BillModel
    .findById(id)
    .populate({ path: 'book' })
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
  const data = new BillModel(body).save();
  responseSuccess(ctx, { data });
}

export async function update(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const body: any = pick(ctx.request.body, ['amount', 'time', 'remark', 'budget']);
  const data = await BillModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }).exec();
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
