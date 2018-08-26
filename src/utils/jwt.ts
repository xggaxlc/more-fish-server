import { sign, verify, decode } from 'jsonwebtoken';
import { config } from '../config';
const SECRETKEY = config.jwtSecret;

export const createToken = (payload: { id: string }): Promise<string> => {
  return new Promise(resolve => {
    const options = { expiresIn: config.jwtExpires }
    sign(payload, SECRETKEY, options, (err, token) => {
      if (err) {
        throw {
          status: 401,
          message: err.message
        }
      }
      resolve(token);
    });
  });
}

export const decodeToken = (token: string): Promise<{id: string}> => {
  return new Promise(resolve => {
    const options = { ignoreExpiration: false }
    verify(token, SECRETKEY, options, (err, decodeInfo: { id: string }) => {
      if (err) {
        console.log(err.message, 1)
        throw {
          status: 401,
          message: err.message
        }
      }
      resolve(decodeInfo);
    });
  });
}
