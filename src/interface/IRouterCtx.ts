import { IPagination } from './IPagination';
import { IRouterContext } from 'koa-router';
import { IUserInfo } from './IUserInfo';
import { IBookModel } from '../controller/book/book.model';

export interface IRouterCtx extends IRouterContext {
  pagination?: IPagination,
  user: IUserInfo,
  book?: IBookModel
}
