import { IRouterCtx } from '../interface/IRouterCtx';
import { BookModel } from '../controller/book/book.model';
import { throwNotFound, throwForbidden } from '../utils/handle-response';
import { IUserModel } from '../controller/user/user.model';

export async function checkUserInBook(ctx: IRouterCtx, next: () => Promise<any>) {
  const { bookId } = ctx.params;
  const { id: userId } = ctx.user;
  const book = await BookModel
    .findById(bookId)
    .populate({ path: 'users' })
    .populate({ path: 'create_user' });

  if (!book) {
    return throwNotFound();
  }

  const users = book.users as IUserModel[];
  const user = users.find(userObj => String(userObj._id) === String(userId));

  if (!user) {
    return throwForbidden();
  }

  ctx.book = book;
  await next();
}
