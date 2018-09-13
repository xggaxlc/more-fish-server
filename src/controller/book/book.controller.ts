import { BillModel } from './../bill/bill.model';
import { BudgetModel } from './../budget/budget.model';
import { IUserModel } from '../user/user.model';
import { IRouterCtx } from './../../interface/IRouterCtx';
import { BookModel } from './book.model';
import { pick, flatten, isArray } from 'lodash';
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
  const { id: userId } = ctx.user;
  const { bookId } = ctx.params;
  const data = await BookModel
    .findById(bookId)
    .populate({ path: 'users' })
    .populate({ path: 'create_user' })
    .exec();

  if (!data) {
    throwNotFound();
  }

  const book = data.toObject();
  const users = book.users as IUserModel[];
  const userIsMember = !!users.find(userObj => String(userObj._id) === String(userId));

  if (!userIsMember) {
    book.users = users.map(user => pick(user, ['avatarUrl', 'nickName', '_id'])) as any;
    book.create_user = pick(book.create_user, ['avatarUrl', 'nickName', '_id']) as any;
  }
  return responseSuccess(ctx, { data: book });
}

export async function create(ctx: IRouterCtx) {
  const { id } = ctx.user;
  const { name, remark } = ctx.request.body as any;
  const create_user = id;
  const users = [id];
  const body = { name, remark, create_user, users };
  const book = await new BookModel(body).save();
  responseSuccess(ctx, { data: book }, 201);
}

export async function update(ctx: IRouterCtx) {
  const { id: userId } = ctx.user;
  const book = ctx.book;
  const updateBody: any = pick(ctx.request.body, ['name', 'remark', 'users']);
  // 不可以删除自己
  if (isArray(updateBody.users)) {
    (updateBody.users as Array<any>).unshift(userId);
    updateBody.users = flatten(updateBody.users);
  }
  await book.update(updateBody).exec();
  responseSuccess(ctx, { data: Object.assign({}, book.toObject(), updateBody) });
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

export async function exit(ctx: IRouterCtx) {
  const book = ctx.book;
  const deleteUserId = String(ctx.user.id);
  const creatorId = String((book.create_user as IUserModel)._id);

  if (creatorId === deleteUserId) {
    throwCommonError('创建者无法退出账本，请删除账本');
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
