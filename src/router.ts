import * as userController from './controller/user/user.controller';
import * as bookController from './controller/book/book.controller';
import * as budgetController from './controller/budget/budget.controller';
import * as billController from './controller/bill/bill.controller';
import * as statController from './controller/stat/stat.controller';

import { checkLogin } from './middleware/checkLogin';
import { handleError } from './middleware/handleError';
import { pagination } from './middleware/pagination';
import { checkUserInBook } from './middleware/checkUserInBook';
import { checkUserIsBookCreator } from './middleware/checkUserIsBookCreator';

import * as Router from 'koa-router';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';

export default (app: Koa) => {
  const router = new Router();

  router.get('/users/me', checkLogin, userController.show);
  router.put('/users/me', checkLogin, userController.update);
  router.post('/users/login', userController.login);

  router.get('/books', checkLogin, pagination, bookController.index);
  router.get('/books/:bookId', checkLogin, checkUserInBook, bookController.show);
  router.post('/books', checkLogin, bookController.create);
  router.put('/books/:bookId', checkLogin, checkUserInBook, checkUserIsBookCreator, bookController.update);
  router.delete('/books/:bookId', checkLogin, checkUserInBook, checkUserIsBookCreator, bookController.destroy);
  router.put('/books/:bookId/join', checkLogin, bookController.join);
  router.get('/books/:bookId/join', checkLogin, bookController.getJoin);
  router.put('/books/:id/deleteUser', checkLogin, checkUserInBook, bookController.deleteUser);

  router.get('/books/:bookId/budgets', checkLogin, checkUserInBook, budgetController.index);
  router.get('/books/:bookId/budgets/:id', checkLogin, checkUserInBook, budgetController.show);
  router.post('/books/:bookId/budgets', checkLogin, checkUserInBook, checkUserIsBookCreator, budgetController.create);
  router.put('/books/:bookId/budgets/:id', checkLogin, checkUserInBook, checkUserIsBookCreator, budgetController.update);
  router.delete('/books/:bookId/budgets/:id', checkLogin, checkUserInBook, checkUserIsBookCreator, budgetController.destroy);

  router.get('/books/:bookId/bills', checkLogin, checkUserInBook, pagination, billController.index);
  router.get('/books/:bookId/bills/:id', checkLogin, checkUserInBook, billController.show);
  router.post('/books/:bookId/bills', checkLogin, checkUserInBook, billController.create);
  router.put('/books/:bookId/bills/:id', checkLogin, checkUserInBook, billController.update);
  router.delete('/books/:bookId/bills/:id', checkLogin, checkUserInBook, billController.update);

  router.get('/books/:bookId/stat/getAmountGroupByDay', checkLogin, checkUserInBook, statController.getAmountGroupByDay);

  app
    .use(handleError)
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());
}
