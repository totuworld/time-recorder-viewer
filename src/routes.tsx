import React from 'react';

import { asyncComponent } from '@jaredpalmer/after';

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
  },
  {
    path: '/groups/:group_id',
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/group/container')
    })
  },
  {
    path: '/login',
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/login/index')
    })
  },
  {
    path: '/my/overload',
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/record/overload/container')
    })
  }
];
