import { IRouterContext } from 'koa-router';
import * as mongoose from 'mongoose';

export interface IController {
  Model: mongoose.Model<mongoose.Document>,
  index?: (ctx: IRouterContext) => any,
  show?: (ctx: IRouterContext) => any,
  create?: (ctx: IRouterContext) => any,
  update?: (ctx: IRouterContext) => any,
  destory?: (ctx: IRouterContext) => any
}
