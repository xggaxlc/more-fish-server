import { IRouterCtx } from './../../interface/IRouterCtx';
import * as moment from 'moment';
import { ObjectId } from 'mongodb';
import { BillModel } from '../bill/bill.model';
import { responseSuccess, throwCommonError } from '../../utils/handle-response';
import { config } from '../../config';

export async function getAmountGroupByDay(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const {
    year = moment().get('year'),
    month = moment().get('month')
  } = ctx.query;

  const $time = moment().set('year', year).set('month', month);
  const $startAt = $time.startOf('month');
  const $endAt = $time.endOf('month');

  if (!($startAt.isValid() && $endAt.isValid())) {
    throwCommonError('year 或者 month 格式不对');
  }

  const query: { [key: string]: any } = {
    // TODO 验证ObjectId
    book: new ObjectId(bookId),
    time: { $gte: $startAt.toDate(), $lte: $endAt.toDate() }
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
  const { type = 'month', value = moment().get('month') } = ctx.query;

  if (['month', 'year'].indexOf(type) === -1) {
    throwCommonError('type 格式不对');
  }

  const $time = moment().set(type, value);
  const $startAt = $time.startOf(type);
  const $endAt = $time.endOf(type);

  if (!($startAt.isValid() && $endAt.isValid())) {
    throwCommonError('value 格式不对');
  }

  const query = {
    book: new ObjectId(bookId),
    time: { $gte: $startAt.toDate(), $lte: $endAt.toDate() }
  }
  const data = await BillModel.aggregate([
    {
      $match: query
    },
    {
      $lookup: {
        from: 'budgets',
        localField: 'budget',
        foreignField: '_id',
        as: 'budget_docs',
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            {
              budget_doc: {
                $arrayElemAt: ['$budget_docs', 0]
              }
            },
            '$$ROOT'
          ]
        }
      }
    },
    {
      $group: {
        _id: '$budget_doc.name',
        color: { $last: '$budget_doc.color' },
        budget_amount: { $sum: '$budget_doc.amount' },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { 'amount': -1 }
    }
  ]);
  responseSuccess(ctx, { data });
}
