// 预算
import { model, Schema, Document } from 'mongoose';
import { IBookModel } from '../book/book.model';
const ObjectId = Schema.Types.ObjectId;

export interface IBudgetModel extends Document {
  name: string;
  remark: string;
  amount: number;
  color: string;
  book: IBookModel | string;
  start_at: Date,
  end_at: Date,
  create_at: Date,
  update_at: Date
}

const schema = new Schema({
  name: { type: String, required: [true, 'name 必填'] },
  remark: { type: String },
  amount: { type: Number, required: [true, 'amount 必填'] },
  color: { type: String, default: '#FA4444', required: [true, 'color 必填'] },
  book: { type: ObjectId, ref: 'Book' },
  start_at: { type: Date } ,
  end_at: { type: Date },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

export const BudgetModel = model<IBudgetModel>('Budget', schema);

schema.post('remove', async function(err, doc, next) {
  if (err) throw err;
  const budgetId = doc._id;
  await BudgetModel.updateMany({ budget: budgetId }, { budget: null });
  next();
});
