import { Router } from 'express';

import { GroupController } from '../controller/GroupController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class GroupRoute extends CommonRoute {

  public static bootstrap(): GroupRoute {
    const trRoute = new GroupRoute(new GroupController(), '/api');

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/get_group_infos',
      trRoute.controller.getAllGroupInfos.bind(trRoute.controller),
    );

    return trRoute;
  }

  constructor(public controller: GroupController, prefix: string) {
    super(Router(), prefix);
  }
}