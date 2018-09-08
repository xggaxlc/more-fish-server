import { IRouterCtx } from './../../interface/IRouterCtx';
import * as moment from 'moment';
import { ObjectId } from 'mongodb';
import { BillModel } from '../bill/bill.model';
import { responseSuccess } from '../../utils/handle-response';

export async function getAmountGroupByDay(ctx: IRouterCtx) {
  const { bookId } = ctx.params;
  const startAtDefault = moment().startOf('month');
  const endAtDefault = moment().endOf('month');
  const { start_at = startAtDefault, end_at = endAtDefault } = ctx.query;
  const startAt = moment(start_at).toDate();
  const endAt = moment(end_at).toDate();

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
      $sort: { time: 1 },
    },
    {
      $group: {
        _id: { year: { $year: date }, month: { $month: date }, date: { $dayOfMonth: date } },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  responseSuccess(ctx, { data });
}
