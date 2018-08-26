import { IRouterCtx } from '../interface/IRouterCtx';
import { IResponse } from '../interface/IResponse';
export const handleError = async(ctx: IRouterCtx, next: () => Promise<any>) => {
  try {
    await next();
  } catch (e) {
    const { message: originMessage, name = '', status } = e;

    let statusCode = status || (name === 'ValidationError' ? 400 : 500);
    let message = statusCode >= 500 ? 'Internal Server Error' : originMessage;

    // TODO
    if (originMessage.startsWith('Cast to ObjectId failed')) {
      statusCode = 400;
      message = '请输入正确的id';
    }

    const response: IResponse = {
      success: false,
      message
    }

    if (statusCode >= 500) {
      console.error({
        error: originMessage,
        ip: ctx.ip,
        request: ctx.request,
        params: JSON.stringify(ctx.params),
        body: JSON.stringify(ctx.request.body)
      });
      if (ctx.app.env === 'development') {
        throw e;
      }
    }

    ctx.status = statusCode;
    ctx.body = response;
  }
}
