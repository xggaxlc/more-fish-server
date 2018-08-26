// 周期
import { model, Schema } from 'mongoose';
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  start: { type: Date },
  end: { type: Date },
  budgets: [{
    type: ObjectId,
    ref: 'Budget'
  }],
  book: {
    type: ObjectId,
    ref: 'Book'
  },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

export const PeriodModel = model('Period', schema);
