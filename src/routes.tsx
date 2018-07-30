import React from 'react';

import { asyncComponent } from '@jaredpalmer/after';
import RecordContainer from './components/record/container';

export default [
  {
    path: '/',
    exact: true,
    component: asyncComponent({
      loader: () => import('./Home'), // required
      Placeholder: () => <div>...LOADING...</div> // this is optional, just returns null by default
    })
  },
  {
    path: '/about',
    exact: true,
    component: asyncComponent({
      loader: () => import('./About'), // required
      Placeholder: () => <div>...LOADING...</div> // this is optional, just returns null by default
    })
  },
  {
    path: '/records/:user_id',
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/record/container')
    })
  }
];
