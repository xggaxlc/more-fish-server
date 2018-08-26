import { model, Schema } from 'mongoose';

const schema = new Schema({
  _openId: {
    type: String,
    unique: true,
  },
  avatarUrl: {
    type: String
  },
  city: {
    type: String
  },
  country: {
    type: String
  },
  gender: {
    type: Number
  },
  language: {
    type: String
  },
  nickName: {
    type: String
  },
  province: {
    type: String
  },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

export const UserModel = model('User', schema);
