import { BookModel } from './../controller/book/book.model';
import { queryBudget, createBudget } from '../controller/budget/budget.controller';
import * as schedule from 'node-schedule';
import * as moment from 'moment';
import { config } from '../config';

async function createBudgetSchedule() {
  const books = await BookModel.find({}).exec();
  books.forEach(async(book) => {
    const bookId = book._id;
    const budgets = await queryBudget(bookId);
    const budget = budgets[0];
    if (!budget) {
      const lastMonth = moment().startOf('month').add(-1, 'days');
      const startAt = lastMonth.startOf('month').toDate();
      const endAt = lastMonth.endOf('month').toDate();
      const lastMonthBudgets = await queryBudget(bookId, startAt, endAt);
      const lastMonthBudget = lastMonthBudgets[0];
      lastMonthBudget && createBudget(bookId, lastMonthBudget.toObject());
    }
  });
}

const scheduleJob = schedule.scheduleJob as any;
const tz = config.tz;
const rule = { date: 1, hour: 0, minute: 0, second: 10 };
scheduleJob({ tz, rule }, createBudgetSchedule);
