import { Router } from 'express';

import { EventController } from '../controller/EventController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class EventRoute extends CommonRoute {
  public static bootstrap(): EventRoute {
    const trRoute = new EventRoute(new EventController(), '/api');

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/events',
      trRoute.controller.findAllEvent.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/events',
      trRoute.controller.addEvent.bind(trRoute.controller)
    );

    return trRoute;
  }

  constructor(public controller: EventController, prefix: string) {
    super(Router(), prefix);
  }
}
