// 预算
import { model, Schema } from 'mongoose';
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  name: { type: String },
  remark: { type: String },
  amount: { type: Number },
  color: { type: String },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

export const BudgetModel = model('Budget', schema);
