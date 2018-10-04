import React from 'react';

import { asyncComponent } from '@jaredpalmer/after';

export default [
  {
    path: '/',
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/home/container'), // required
      Placeholder: () => <div>...LOADING...</div> // this is optional, just returns null by default
    })
  },
  {
    path: '/records/:user_id', // 개인 로그 등록 및 살펴보기
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/record/container')
    })
  },
  {
    path: '/queue', // queue 찾기
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/queue/find/container')
    })
  },
  {
    path: '/queue/add/:user_id', // 개인 queue
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/queue/addContainer')
    })
  },
  {
    path: '/groups', // 전체 그룹 목록 출력
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/group/info/container')
    })
  },
  {
    path: '/groups/:group_id', // 특정 그룹 로그 확인
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/group/container')
    })
  },
  {
    path: '/login', // 로그인 페이지
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/login/index')
    })
  },
  {
    path: '/my/overload', // 개인의 초과근무 누적 확인
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/record/overload/container')
    })
  },
  {
    path: '/overload/:user_id', // 특정 개인의 초과 근무 누적 확인
    exact: true,
    component: asyncComponent({
      loader: () => import('./components/record/overload/container')
    })
  }
];
