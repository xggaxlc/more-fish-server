import * as Koa from 'koa';
import * as mongoose from 'mongoose';
import * as cors from '@koa/cors';
import { config } from './config';
import router from './router';
import * as moment from 'moment';

moment.locale('zh-cn');

export const app = new Koa();
app.use(cors());

async function initMongo() {
  try {
    await mongoose.connect(config.mongo.uri, Object.assign({}, config.mongo.options, { useNewUrlParser: true }));
  } catch (err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(-1);
  }
}

function startServer() {
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
}

router(app);
initMongo();
startServer();
