import { IRouterCtx } from './../../interface/IRouterCtx';
import * as moment from 'moment';
import { ObjectId } from 'mongodb';
import { BillModel } from '../bill/bill.model';
import { responseSuccess } from '../../utils/handle-response';

export async function getAmountGroupByDay(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const startAtDefault = moment().startOf('month').toDate();
  const endAtDefault = moment().endOf('month').toDate();
  const { start_at, end_at } = ctx.query;
  const startAt = start_at ? moment(start_at).toDate() : startAtDefault;
  const endAt = end_at ? moment(end_at).toDate() : endAtDefault;

  const query = {
    book: new ObjectId(bookId),
    time: { $gte: startAt, $lte: endAt }
  }

  const date =  { date: "$time", timezone: '+0800' };
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
