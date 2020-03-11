import { Router } from 'express';

import { UserController } from '../controller/UserController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class UserRoute extends CommonRoute {
  public static bootstrap(): UserRoute {
    const trRoute = new UserRoute(new UserController(), '/api');

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/get_groups',
      trRoute.controller.getGroupUserList.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/get_user',
      trRoute.controller.getUserInfo.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/add_login_user',
      trRoute.controller.addLoginUser.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/login_user/:user_uid',
      trRoute.controller.getLoginUserInfo.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/slack_users',
      trRoute.controller.getAllSlackUserInfo.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/get_user/:authId/queue',
      trRoute.controller.findQueue.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/get_user/:userId/queue',
      trRoute.controller.addQueue.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.DELETE)(
      '/get_user/:authId/queue/:key',
      trRoute.controller.deleteQueue.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.PUT)(
      '/active_admin_role/:userId',
      trRoute.controller.activeAdminRole.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.PUT)(
      '/deactive_admin_role/:userId',
      trRoute.controller.deactiveAdminRole.bind(trRoute.controller)
    );

    return trRoute;
  }

  constructor(public controller: UserController, prefix: string) {
    super(Router(), prefix);
  }
}
