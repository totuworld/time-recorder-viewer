import * as express from 'express';
import * as isDocker from 'is-docker';
import * as path from 'path';

import { render } from '@jaredpalmer/after';

import { Config } from './config/Config';
import routes from './routes';
import { TimeRecordRoute } from './server/routes/TimeRecordRoute';
import { UserRoute } from './server/routes/UserRoute';

function routeList() {
  const router = express.Router();
  router.get('/health', (_, res) => { res.send({result: true}); });
  router.use(TimeRecordRoute.bootstrap().router);
  router.use(UserRoute.bootstrap().router);
  return router;
}

let assets: any;

const syncLoadAssets = () => {
  assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);
};
syncLoadAssets();

const staticPath = !isDocker() ? process.env.RAZZLE_PUBLIC_DIR! : path.join(__dirname, '../build/public');

const server = express();
server.disable('x-powered-by');
server.use(express.static(staticPath));
server.use((req, _, next) => {
  req['config'] = Config; // tslint:disable-line
  next();
});
const getRouteList = routeList();

server.use(getRouteList);
server.get('/*', async (req, res) => {
  try {
    const html = await render({
      req,
      res,
      routes,
      assets,
      // Anything else you add here will be made available
      // within getInitialProps(ctx)
      // e.g a redux store...
      customThing: 'thing'
    });
    res.send(html);
  } catch (error) {
    res.json(error);
  }
});

export default server;
