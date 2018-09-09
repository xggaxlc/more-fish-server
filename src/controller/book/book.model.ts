import { BillModel } from './../bill/bill.model';
import { BudgetModel } from './../budget/budget.model';
import { model, Schema, Document } from 'mongoose';
import { IUserModel } from './../user/user.model';
const ObjectId = Schema.Types.ObjectId;

export interface IBookModel extends Document {
  name: string;
  remark: string;
  users: string[] | IUserModel[];
  create_user: string | IUserModel;
  color: string;
  create_at: Date;
  update_at: Date;
}

const schema = new Schema({
  name: { type: String, required: [true, 'name 必填'] },
  remark: { type: String },
  users: [{ type: ObjectId, ref: 'User' }],
  create_user: { type: ObjectId, ref: 'User' },
  color: { type: String, default: '#FF8308' },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

export const BookModel = model<IBookModel>('Book', schema);

schema.post('remove', async function(err, doc, next) {
  if (err) throw err;
  const bookId = doc._id;
  await Promise.all([
    BudgetModel.remove({ book: bookId }),
    BillModel.remove({ book: bookId })
  ]);
  next();
});
