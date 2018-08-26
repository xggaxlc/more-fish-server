import { IRouterCtx } from './../interface/IRouterCtx';
import { IUserModel } from '../controller/user/user.model';
import { throwForbidden } from '../utils/handle-response';

export async function checkUserIsBookCreator(ctx: IRouterCtx, next: () => Promise<any>) {
  const book = ctx.book;
  const { id: userId } = ctx.user;

  const creatorId = (book.create_user as IUserModel)._id;
  if (String(creatorId) !== String(userId)) {
    throwForbidden();
  }

  await next();
}
