import { Router } from 'express';

import { SlackController } from '../controller/SlackController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class SlackRoute extends CommonRoute {
  public static bootstrap(): SlackRoute {
    const trRoute = new SlackRoute(new SlackController(), '/api');

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/api/chat.postMessage',
      trRoute.controller.sendQueueMessageToUser.bind(trRoute.controller)
    );

    return trRoute;
  }

  constructor(public controller: SlackController, prefix: string) {
    super(Router(), prefix);
  }
}
