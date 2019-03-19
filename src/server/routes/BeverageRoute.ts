import { Router } from 'express';

import { BeverageController } from '../controller/BeverageController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class BeverageRoute extends CommonRoute {
  public static bootstrap(): BeverageRoute {
    const trRoute = new BeverageRoute(new BeverageController(), '/api');

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/beverages',
      trRoute.controller.findAll.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/beverages',
      trRoute.controller.add.bind(trRoute.controller)
    );

    return trRoute;
  }

  constructor(public controller: BeverageController, prefix: string) {
    super(Router(), prefix);
  }
}
