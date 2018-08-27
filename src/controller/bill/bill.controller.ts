import { pick } from 'lodash';
import { BillModel } from './bill.model';
import { IRouterCtx } from '../../interface/IRouterCtx';
import { responseSuccess, throwNotFound } from '../../utils/handle-response';
import { Types } from 'mongoose';
import * as moment from 'moment';

const ObjectId = Types.ObjectId;

export async function index(ctx: IRouterCtx) {
  const { bookId } = ctx.params;

  const {
    start_at = moment().startOf('month').toDate(),
    end_at = moment().endOf('month').toDate()
  } = ctx.query;

  const query: any = {
    book: ObjectId(bookId),
    time: { $gte: start_at, $lte: end_at }
  };

  const data = await BillModel.aggregate([
    {
      $match: query,
    },
    {
      $sort: { time: 1 },
    },
    {
      $lookup: {
        from: 'budgets',
        localField: 'budget',
        foreignField: '_id',
        as: 'budget'
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'create_user',
        foreignField: '_id',
        as: 'create_user'
      }
    },
    {
      $group: {
        _id: { year: { $year: "$time" }, month: { $month: "$time" }, day: { $dayOfMonth: "$time" } },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        list: {
          $push: '$$ROOT',
        }
      }
    }
  ]);

  const responseData = data.map(item => {
    const { year, month, day } = item._id;
    return {
      ...item,
      fromNow: moment().set({ year, month: month - 1, date: day }).fromNow(),
      list: item.list.map((bill: any) => {
        return {
          ...bill,
          budget: bill.budget[0],
          create_user: bill.create_user[0]
        }
      })
    }
  });

  responseSuccess(ctx, { data: responseData  });
}

export async function show(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const data = await BillModel
    .findById(id)
    .populate({ path: 'budget' })
    .populate({ path: 'create_user' })
    .exec();
  if (!data) {
    throwNotFound();
  }
  responseSuccess(ctx, { data });
}

export async function create(ctx: IRouterCtx) {
  const body: any = pick(ctx.request.body, ['amount', 'time', 'remark', 'budget']);
  body.book = ctx.book._id;
  body.create_user = ctx.user.id;
  const { _id } = await new BillModel(body).save();
  const data = await BillModel
    .findById(_id)
    .populate({ path: 'budget' })
    .populate({ path: 'create_user' })
    .exec();
  responseSuccess(ctx, { data });
}

export async function update(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const body: any = pick(ctx.request.body, ['amount', 'time', 'remark', 'budget']);
  const data = await BillModel
    .findByIdAndUpdate(id, body, { new: true, runValidators: true })
    .populate({ path: 'budget' })
    .populate({ path: 'create_user' })
    .exec();
  if (!data) {
    throwNotFound();
  }
  responseSuccess(ctx, { data });
}

export async function destroy(ctx: IRouterCtx) {
  const { id } = ctx.params;
  const data = await BillModel.findByIdAndRemove(id).exec();
  if (!data) {
    throwNotFound();
  }
  responseSuccess(ctx, {}, 204);
}
