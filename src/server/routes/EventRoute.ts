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

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/events/:event_id',
      trRoute.controller.findEvent.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.PUT)(
      '/events/:event_id',
      trRoute.controller.closeEvent.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/events/:event_id/guests',
      trRoute.controller.findEventGuests.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/events',
      trRoute.controller.addEvent.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/events/:eventId/orders',
      trRoute.controller.addOrder.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.DELETE)(
      '/events/:eventId/orders/:guestId',
      trRoute.controller.deleteOrder.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/events/:event_id/orders',
      trRoute.controller.orders.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/events/:eventId/guests/msg',
      trRoute.controller.sendMsgToGuests.bind(trRoute.controller)
    );

    return trRoute;
  }

  constructor(public controller: EventController, prefix: string) {
    super(Router(), prefix);
  }
}
