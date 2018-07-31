import './client.css';

import React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { After, ensureReady } from '@jaredpalmer/after';

import Document from './Document';
import routes from './routes';

ensureReady(routes).then((data) =>
  hydrate(
    <BrowserRouter>
      <After data={data} routes={routes} document={Document} />
    </BrowserRouter>,
    document.getElementById('root')
  )
);

if (module.hot) {
  module.hot.accept();
}
