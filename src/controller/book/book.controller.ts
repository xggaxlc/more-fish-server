import { BillModel } from './../bill/bill.model';
import { BudgetModel } from './../budget/budget.model';
import { IUserModel } from '../user/user.model';
import { IRouterCtx } from './../../interface/IRouterCtx';
import { BookModel } from './book.model';
import { pick } from 'lodash';
import { getPaginationMeta, responseSuccess, throwCommonError, throwForbidden, throwNotFound } from '../../utils/handle-response';

export async function index(ctx: IRouterCtx) {
  const { id } = ctx.user;
  const { name } = ctx.query;
  const query: any = { users: id };
  const { limit, skip } = ctx.pagination;
  name && (query.name = { $regex: name });
  const [data, count] = await Promise.all([
    BookModel
      .find(query)
      .limit(limit)
      .skip(skip),
    BookModel.countDocuments(query)
  ]);
  const meta = getPaginationMeta(count, limit, skip);
  responseSuccess(ctx, { data, meta });
}

export async function show(ctx: IRouterCtx) {
  responseSuccess(ctx, { data: ctx.book });
}

export async function create(ctx: IRouterCtx) {
  const { id } = ctx.user;
  const { name, remark } = ctx.request.body as any;
  const create_user = id;
  const users = [id];
  const body = { name, remark, create_user, users };
  const book = await new BookModel(body).save();
  responseSuccess(ctx, { data: book });
}

export async function update(ctx: IRouterCtx) {
  const book = ctx.book;
  const updateBody = pick(ctx.request.body, ['name', 'remark', 'users']);
  await book.update(updateBody).exec();
  responseSuccess(ctx, { data: Object.assign({}, book.toObject(), updateBody) });
}

export async function getJoin(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const data = await BookModel
    .findById(bookId)
    .populate({ path: 'users', select: ['avatarUrl', 'nickName', '_id'] })
    .populate({ path: 'create_user', select: ['avatarUrl', 'nickName', '_id'] })
    .exec();

  if (!data) {
    throwNotFound();
  }
  responseSuccess(ctx, { data });
}

export async function join(ctx: IRouterCtx) {
  const { id: userId } = ctx.user;
  const { bookId } = ctx.params;
  const book = await BookModel
    .findById(bookId)
    .populate({ path: 'create_user' });
  if (!book) {
    return throwNotFound();
  }
  const users = book.users as string[];
  const user = users.find(user => String(user) === String(userId));
  if (user) {
    throwCommonError('你已经在此账本中了');
  }
  const updateBody = { users: users.concat([userId]) };
  await book.update(updateBody).exec();
  responseSuccess(ctx, { data: Object.assign({}, book.toObject(), updateBody) });
}

export async function deleteUser(ctx: IRouterCtx) {
  const book = ctx.book;
  const userId = String(ctx.user.id);
  const creatorId = String((book.create_user as IUserModel)._id);
  const deleteUserId = String((ctx.request.body as any).id);
  if (userId === creatorId) {
    // 创建者
    // 不能删除自己
    if (deleteUserId === userId) {
      throwCommonError('创建者不能退出账本，请删除账本');
    }
  } else {
    // 非创建者
    // 不能删除除自己以外的人
    if (deleteUserId !== userId) {
      throwForbidden();
    }
  }
  const userIds = (book.users as IUserModel[]).map(userObj => userObj._id);
  const deleteUserIndex = userIds.findIndex(userId => String(userId) === deleteUserId);
  userIds.splice(deleteUserIndex, 1);
  const updateBody = { users: userIds };
  await book.update(updateBody);
  responseSuccess(ctx, { data: Object.assign({}, book.toString(), updateBody) });
}

export async function destroy(ctx: IRouterCtx) {
  const book = ctx.book;
  await book.remove();
  responseSuccess(ctx);

  const bookId = book._id;
  Promise.all([
    BudgetModel.remove({ book: bookId }),
    BillModel.remove({ book: bookId })
  ]);
}
