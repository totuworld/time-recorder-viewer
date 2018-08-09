import { Router } from 'express';

import { UserController } from '../controller/UserController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class UserRoute extends CommonRoute {

  public static bootstrap(): UserRoute {
    const trRoute = new UserRoute(new UserController(), '/api');

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/get_groups',
      trRoute.controller.getGroupUserList.bind(trRoute.controller),
    );

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/get_user',
      trRoute.controller.getUserInfo.bind(trRoute.controller),
    );

    return trRoute;
  }

  constructor(public controller: UserController, prefix: string) {
    super(Router(), prefix);
  }
}