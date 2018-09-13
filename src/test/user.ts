import { UserModel } from './../controller/user/user.model';
import { describe } from 'mocha';
import * as supertest from 'supertest';
import * as should from 'should';
import { app } from '../app';
import { loginByOpenId } from '../controller/user/user.controller';

const request = supertest(app.listen());
const MOCK_OPEN_ID = 'mock_open_id';

describe('Users', () => {
  before(async() => {
    await UserModel.remove({}).exec();
  });

  after(async() => {
    await UserModel.remove({}).exec();
  });

  describe('POST /users/login', () => {
    it('并发登录', async() => {
      await Promise.all([
        loginByOpenId(MOCK_OPEN_ID),
        loginByOpenId(MOCK_OPEN_ID)
      ])
    });
  });

  describe('GET /users/me', () => {
    it('没登录返回401', async() => {
      await request.get('/users/me').expect(401);
    });

    it('有authorization header返回200', async() => {
      const { token, user: { _id } } = await loginByOpenId(MOCK_OPEN_ID);
      const { body: { data } } = await request.get('/users/me')
        .set('authorization', token)
        .expect(200);
      should(data._id).eql(_id.toString());
    });

    it('有Authorization header返回200', async() => {
      const { token, user: { _id } } = await loginByOpenId(MOCK_OPEN_ID);
       const { body: { data } } = await request.get('/users/me')
        .set('Authorization', token)
        .expect(200);
      should(data._id).eql(_id.toString());
    });

    it('有authorization query返回200', async() => {
      const { token, user: { _id } } = await loginByOpenId(MOCK_OPEN_ID);
       const { body: { data } } = await request.get('/users/me')
        .query({ authorization: token })
        .expect(200);
      should(data._id).eql(_id.toString());
    });
  });

  describe('PUT /users/me', () => {

    it('没登录返回401', async() => {
      await request.put('/users/me').expect(401);
    });

    it('不更新不存在的字段', async() => {
      const { token } = await loginByOpenId(MOCK_OPEN_ID);
      const { body: { data } } = await request.put('/users/me')
        .set('Authorization', token)
        .send({ aaa: 111 });
      should(data).have.not.property('aaa');
    });

    it('不更新_id', async() => {
      const { token, user: { _id } } = await loginByOpenId(MOCK_OPEN_ID);
      const { body: { data } } = await request.put('/users/me')
        .set('Authorization', token)
        .send({ _id: 111 });
      should(data._id).eql(_id.toString());
    });
  });
});
