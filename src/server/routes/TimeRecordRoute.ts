import { Router } from 'express';

import { TimeRecordController } from '../controller/TimeRecordController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class TimeRecordRoute extends CommonRoute {

  public static bootstrap(): TimeRecordRoute {
    const trRoute = new TimeRecordRoute(new TimeRecordController(), '/api');

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/get_all',
      trRoute.controller.findTimeRecord.bind(trRoute.controller),
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/command_ping',
      trRoute.controller.addTimeRecord.bind(trRoute.controller),
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/update_record',
      trRoute.controller.updateTimeRecord.bind(trRoute.controller),
    );

    return trRoute;
  }

  constructor(public controller: TimeRecordController, prefix: string) {
    super(Router(), prefix);
  }
}