import { createToken } from './../utils/jwt';
import { UserModel } from './../controller/user/user.model';
import { describe } from 'mocha';
import * as supertest from 'supertest';
import * as should from 'should';
import { app } from '../app';

const request = supertest(app.listen());
const MOCK_OPEN_ID = 'mock_open_id';

let token: string;
let userId: string;

describe('Users', () => {
  before(async() => {
    await UserModel.remove({}).exec();
    const { _id } = await new UserModel({ _openId: MOCK_OPEN_ID }).save();
    userId = _id.toString();
    token = await createToken({ id: userId });
  });

  after(async() => {
    await UserModel.remove({});
  });

  describe('GET /users/me', () => {
    it('没登录返回401', async() => {
      await request.get('/users/me').expect(401);
    });

    it('有authorization header返回200', async() => {
      const { body: { data } } = await request.get('/users/me')
        .set('authorization', token)
        .expect(200);
      should(data._id).eql(userId);
    });

    it('有Authorization header返回200', async() => {
       const { body: { data } } = await request.get('/users/me')
        .set('Authorization', token)
        .expect(200);
      should(data._id).eql(userId);
    });

    it('有authorization query返回200', async() => {
       const { body: { data } } = await request.get('/users/me')
        .query({ authorization: token })
        .expect(200);
      should(data._id).eql(userId);
    });
  });

  describe('PUT /users/me', () => {

    it('没登录返回401', async() => {
      await request.put('/users/me').expect(401);
    });

    it('不更新不存在的字段', async() => {
      const { body: { data } } = await request.put('/users/me')
        .set('Authorization', token)
        .send({ aaa: 111 });
      should(data).have.not.property('aaa');
    });

    it('不更新_id', async() => {
      const { body: { data } } = await request.put('/users/me')
        .set('Authorization', token)
        .send({ _id: 111 });
      should(data._id).eql(userId);
    });
  });
});
