import { IBudgetModel } from './../budget/budget.model';
import { IBookModel } from './../book/book.model';
import { model, Schema, Document } from 'mongoose';
import { IUserModel } from '../user/user.model';
const ObjectId = Schema.Types.ObjectId;

export interface IBillModel extends Document {
  amount: number;
  time: Date;
  remark?: string;
  book: IBookModel | string;
  budget: IBudgetModel | string;
  create_user: IUserModel | string;
  create_at: Date;
  update_at: Date;
}

const schema = new Schema({
  amount: { type: Number, required: [true, 'name 必填'] },
  time: { type: Date, required: [true, 'name 必填'] },
  remark: { type: String },
  book: { type: ObjectId, ref: 'Book' },
  budget: { type: ObjectId, ref: 'budget' },
  create_user: { type: ObjectId, ref: 'User' },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

export const BillModel = model<IBillModel>('Bill', schema);
