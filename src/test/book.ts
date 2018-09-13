import { BookModel } from './../controller/book/book.model';
import { UserModel } from './../controller/user/user.model';
import { describe } from 'mocha';
import * as supertest from 'supertest';
import * as should from 'should';
import { app } from '../app';
import { loginByOpenId } from '../controller/user/user.controller';

const request = supertest(app.listen());

const mockData = {
  user1: {
    open_id: 'user_1'
  },
  user2: {
    open_id: 'user_2'
  },
  book: {
    name: 'test'
  }
}

describe('Books', () => {
  before(async() => {
    await Promise.all([
      UserModel.remove({}).exec(),
      BookModel.remove({}).exec()
    ]);
  });

  after(async() => {
    await Promise.all([
      UserModel.remove({}).exec(),
      BookModel.remove({}).exec()
    ]);
  });

  describe('POST /books', () => {
    it('需要登录', async() => {
      return request.post('/books')
        .expect(401);
    });
    it('name必填', async() => {
      const { token } = await loginByOpenId(mockData.user1.open_id);
      await request.post('/books')
        .set('authorization', token)
        .expect(400);
    });
    it('成功创建', async() => {
      const { token, user } = await loginByOpenId(mockData.user1.open_id);
      const { body: { data } } = await request.post('/books')
        .send({ name: mockData.book.name })
        .set('authorization', token)
        .expect(201);
      should(data.create_user).eql(user._id.toString());
      should(data.users).containEql(user._id.toString());
    });
  });
});

describe('GET /books/:bookId', () => {
  let user1Token: string;
  let user2Token: string;
  let user1;
  let user2;
  let book1: any;

  before(async () => {
    await Promise.all([
      UserModel.remove({}).exec(),
      BookModel.remove({}).exec()
    ]);
  });

  beforeEach(async() => {
    const arr = await Promise.all([
      loginByOpenId(mockData.user1.open_id),
      loginByOpenId(mockData.user2.open_id)
    ]);
    user1Token = arr[0].token;
    user2Token = arr[1].token;
    user1 = arr[0].user;
    user2 = arr[1].user;

    const { body: { data } } = await request.post('/books')
    .set('authorization', user1Token)
    .send({ name: 'user1_book' });
    book1 = data;
  });

  it('user不是成员', async() => {
    const { body: { data } } = await request.get(`/books/${book1._id}`)
      .set('authorization', user2Token)
      .expect(200);
    should(data.create_user).has.not.property('create_at');
  });

  it('user是成员', async() => {
    const { body: { data } } = await request.get(`/books/${book1._id}`)
      .set('authorization', user1Token)
      .expect(200);
    should(data.create_user).has.property('create_at');
  });
});


describe('PUT /books/:bookId', () => {

  let user1Token: string;
  let user2Token: string;
  let user1;
  let user2;
  let book1: any;

  before(async () => {
    await Promise.all([
      UserModel.remove({}).exec(),
      BookModel.remove({}).exec()
    ]);
  });

  after(async () => {
    await Promise.all([
      UserModel.remove({}).exec(),
      BookModel.remove({}).exec()
    ]);
  })

  beforeEach(async() => {
    const arr = await Promise.all([
      loginByOpenId(mockData.user1.open_id),
      loginByOpenId(mockData.user2.open_id)
    ]);
    user1Token = arr[0].token;
    user2Token = arr[1].token;
    user1 = arr[0].user;
    user2 = arr[1].user;

    const { body: { data } } = await request.post('/books')
    .set('authorization', user1Token)
    .send({ name: 'user1_book' });
    book1 = data;
  });

  it('创建者修改名称', async() => {
    const { body: { data } } = await request.put(`/books/${book1._id}`)
      .set('authorization', user1Token)
      .send({ name: 'book_2' })
      .expect(200);
    should(data.name).eql('book_2');
  });

  it('非成员非创建者修改名称', async() => {
    await request.put(`/books/${book1._id}`)
      .set('authorization', user2Token)
      .send({ name: 'book_2' })
      .expect(403);
  });
  // it('成员非创建者修改名称');
});
