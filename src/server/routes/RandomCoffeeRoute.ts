import { Router } from 'express';

import { RandomCoffeeController } from '../controller/RandomCoffeeController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class RandomCoffeeRoute extends CommonRoute {
  public static bootstrap(): RandomCoffeeRoute {
    const trRoute = new RandomCoffeeRoute(new RandomCoffeeController(), '/api');

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/random_coffee',
      trRoute.controller.findAll.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/random_coffee/:event_id',
      trRoute.controller.find.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/random_coffee',
      trRoute.controller.add.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.PUT)(
      '/random_coffee/:eventId',
      trRoute.controller.update.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/random_coffee/:event_id/guests',
      trRoute.controller.findGuests.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/random_coffee/:eventId/guests',
      trRoute.controller.addGuests.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.DELETE)(
      '/random_coffee/:eventId/guests/:docId',
      trRoute.controller.delGuest.bind(trRoute.controller)
    );

    return trRoute;
  }

  constructor(public controller: RandomCoffeeController, prefix: string) {
    super(Router(), prefix);
  }
}
