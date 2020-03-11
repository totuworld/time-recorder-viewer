import CoffeeAddContainer from './components/coffee/add/container';
import CoffeeContainer from './components/coffee/container';
import CoffeeDetailContainer from './components/coffee/detail/container';
import GroupContainer from './components/group/container';
import GroupInfoContainer from './components/group/info/container';
import HomeContainer from './components/home/container';
import Login from './components/login';
import QueueAddContainer from './components/queue/addContainer';
import QueueFindContainer from './components/queue/find/container';
import RecordContainer from './components/record/container';
import RecordFuseVacationContainer from './components/record/fuse_vacation/container';
import RecordOverloadContainer from './components/record/overload/container';
import UserContainer from './components/user/container';

export default [
  {
    path: '/',
    exact: true,
    component: HomeContainer
  },
  {
    path: '/user/:user_id',
    exact: true,
    component: UserContainer
  },
  {
    path: '/records/:user_id', // 개인 로그 등록 및 살펴보기
    exact: true,
    component: RecordContainer
  },
  {
    path: '/queue', // queue 찾기
    exact: true,
    component: QueueFindContainer
  },
  {
    path: '/queue/add/:user_id', // 개인 queue
    exact: true,
    component: QueueAddContainer
  },
  {
    path: '/groups', // 전체 그룹 목록 출력
    exact: true,
    component: GroupInfoContainer
  },
  {
    path: '/groups/:group_id', // 특정 그룹 로그 확인
    exact: true,
    component: GroupContainer
  },
  {
    path: '/login', // 로그인 페이지
    exact: true,
    component: Login
  },
  {
    path: '/my/overload', // 개인의 초과근무 누적 확인
    exact: true,
    component: RecordOverloadContainer
  },
  {
    path: '/overload/:user_id', // 특정 개인의 초과 근무 누적 확인
    exact: true,
    component: RecordOverloadContainer
  },
  {
    path: '/convert_vacation/:user_id', // 특정 개인의 휴가금고 확인
    exact: true,
    component: RecordFuseVacationContainer
  },

  {
    path: '/coffeebreak',
    exact: true,
    component: CoffeeContainer
  },
  {
    path: '/coffeebreak/add',
    exact: true,
    component: CoffeeAddContainer
  },
  {
    path: '/coffeebreak/:event_id',
    exact: true,
    component: CoffeeDetailContainer
  }
];
