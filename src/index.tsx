import debug from 'debug';
import http from 'http';

import app from './server';

const log = debug('trv:index');

const server = http.createServer(app);

let currentApp = app;

server.listen(process.env.PORT || 3000, (error: any) => {
  if (error) {
    log(error);
  }

  log('🚀 started');
});

if (module.hot) {
  log('✅  Server-side HMR Enabled!');

  module.hot.accept('./server', () => {
    log('🔁  HMR Reloading `./server`...');
    server.removeListener('request', currentApp);
    const newApp = require('./server').default;
    server.on('request', newApp);
    currentApp = newApp;
  });
}
