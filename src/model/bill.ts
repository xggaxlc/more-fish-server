// 账单
import { model, Schema } from 'mongoose';
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  remark: { type: String },
  period: { type: ObjectId, ref: 'Period' },
  create_user: { type: ObjectId, ref: 'User' },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

export const BillModel = model('Bill', schema);
