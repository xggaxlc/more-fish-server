import { model, Schema, Document } from 'mongoose';

export interface IUserModel extends Document {
  _openId: string;
  avatarUrl: string;
  city: string;
  country: string;
  gender: string;
  language: string;
  nickName: string;
  province: string;
  create_at: Date;
  update_at: Date;
}

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
