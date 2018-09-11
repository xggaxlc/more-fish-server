import { createToken } from './../utils/jwt';
import { UserModel } from './../controller/user/user.model';
import { describe } from 'mocha';
import * as supertest from 'supertest';
import * as should from 'should';
import { app } from '../app';

const request = supertest(app.listen());

describe('Books', () => {
  it('')
});
