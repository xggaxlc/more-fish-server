// 账本
import { model, Schema } from 'mongoose';
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  name: { type: String },
  remark: { type: String },
  users: [{ type: ObjectId, ref: 'User' }],
  create_user: { type: ObjectId, ref: 'User' },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

export const BookModel = model('Book', schema);
