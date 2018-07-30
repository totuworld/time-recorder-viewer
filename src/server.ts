import * as express from 'express';

import { render } from '@jaredpalmer/after';

import { Config } from './config/Config';
import routes from './routes';

let assets: any;

const syncLoadAssets = () => {
  assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);
};
syncLoadAssets();

const server = express();
server.disable('x-powered-by');
server.use(express.static(process.env.RAZZLE_PUBLIC_DIR!));
server.use((req, _, next) => {
  req['config'] = Config; // tslint:disable-line
  next();
});
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
