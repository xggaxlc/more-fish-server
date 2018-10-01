import { BudgetModel } from './../budget/budget.model';
import { IRouterCtx } from './../../interface/IRouterCtx';
import * as moment from 'moment';
import { ObjectId } from 'mongodb';
import { BillModel } from '../bill/bill.model';
import { responseSuccess, throwCommonError } from '../../utils/handle-response';
import { config } from '../../config';
import * as _ from 'lodash';

export async function getAmountGroupByDay(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const {
    budget,
    start_at = moment().startOf('month'),
    end_at = moment().endOf('month')
  } = ctx.query;

  const $startAt = moment(start_at);
  const $endAt = moment(end_at);

  if (!($startAt.isValid() && $endAt.isValid())) {
    throwCommonError('start_at end_at 格式不对');
  }

  const query: { [key: string]: any } = {
    // TODO 验证ObjectId
    book: new ObjectId(bookId),
    time: { $gte: $startAt.toDate(), $lte: $endAt.toDate() }
  }

  if (budget) {
    // TODO 验证ObjectId
    query.budget = new ObjectId(budget)
  }

  const date = { date: "$time", timezone: config.tz };
  const data = await BillModel.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: { year: { $year: date }, month: { $month: date }, date: { $dayOfMonth: date } },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': -1 },
    },
  ]);

  responseSuccess(ctx, { data });
}

export async function getAmountGroupByBudgetName(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const {
    start_at = moment().startOf('month'),
    end_at = moment().endOf('month')
   } = ctx.query;

  const $startAt = moment(start_at);
  const $endAt = moment(end_at);

  if (!($startAt.isValid() && $endAt.isValid())) {
    throwCommonError('start_at end_at 格式不对');
  }

  const billQuery = {
    book: new ObjectId(bookId),
    time: { $gte: $startAt.toDate(), $lte: $endAt.toDate() }
  }

  const budgetQuery = {
    book: new ObjectId(bookId),
    start_at: { $gte: $startAt.toDate() },
    end_at: { $lte: $endAt.toDate() }
  }

  const [budgets, billDataGroupByBudgetId] = await Promise.all([
    BudgetModel.find(budgetQuery).exec(),
    BillModel.aggregate([
      {
        $match: billQuery
      },
      {
        $group: {
          _id: '$budget',
          amount: { $sum: '$amount' },
        }
      }
    ]).exec()
  ]);

  const budgetDataGroupByBudgetsId = budgets.map(budget => {
    return {
     ...budget.toObject(),
      bill_amount: _.get(billDataGroupByBudgetId.find((item: any) => String(item._id) === String(budget._id)), 'amount', 0)
    }
  });

  const names = _.uniq(budgets.map(item => item.name));

  const data = names.map(name => {
    const budgets = budgetDataGroupByBudgetsId.filter(item => item.name === name);
    return {
      _id: name,
      color: _.get(_.last(budgets), 'color', '#666'),
      amount: _.sumBy(budgets, 'bill_amount'),
      budget_amount: _.sumBy(budgets, 'amount')
    }
  });

  const noBudgetData = billDataGroupByBudgetId.find((item: any) => !item._id);
  if (noBudgetData) {
    data.push({
      _id: '未知',
      color: '#666',
      amount: noBudgetData.amount,
      budget_amount: 0
    });
  }

  const sortedData = data.sort((a, b) => b.amount - a.amount);

  responseSuccess(ctx, { data: sortedData });
}
