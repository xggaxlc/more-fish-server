import { BookModel } from './../controller/book/book.model';
import { queryBudget, createBudget } from '../controller/budget/budget.controller';
import * as schedule from 'node-schedule';
import * as moment from 'moment';
import { config } from '../config';

async function createBudgetSchedule() {
  const books = await BookModel.find({}).exec();
  books.forEach(async(book) => {
    const bookId = book._id;
    const $lastMonth = moment().startOf('month').add(-1, 'days');
    const lastMonthBudgets = await queryBudget(bookId, moment($lastMonth).startOf('month'), moment($lastMonth).endOf('month'));
    lastMonthBudgets.forEach(lastMonthBudget => createBudget(bookId, lastMonthBudget.toObject()));
  });
}

const scheduleJob = schedule.scheduleJob as any;
const tz = config.tz;
const rule = { date: 1, hour: 0, minute: 0, second: 1 };
scheduleJob({ tz, rule }, createBudgetSchedule);
