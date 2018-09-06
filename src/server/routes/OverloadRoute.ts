import { Router } from 'express';

import { OverloadController } from '../controller/OverloadController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class OverloadRoute extends CommonRoute {

  public static bootstrap(): OverloadRoute {
    const oRoute = new OverloadRoute(new OverloadController(), '/api');

    oRoute.route(EN_REQUEST_METHODS.GET)(
      '/over_works',
      oRoute.controller.findAll.bind(oRoute.controller),
    );

    return oRoute;
  }

  constructor(public controller: OverloadController, prefix: string) {
    super(Router(), prefix);
  }
}