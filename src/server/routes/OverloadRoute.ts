import { Router } from 'express';

import { OverloadController } from '../controller/OverloadController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class OverloadRoute extends CommonRoute {
  public static bootstrap(): OverloadRoute {
    const oRoute = new OverloadRoute(new OverloadController(), '/api');

    oRoute.route(EN_REQUEST_METHODS.DELETE)(
      '/over_work',
      oRoute.controller.deleteOverloadByUserID.bind(oRoute.controller)
    );
    oRoute.route(EN_REQUEST_METHODS.GET)(
      '/over_works',
      oRoute.controller.findAll.bind(oRoute.controller)
    );
    oRoute.route(EN_REQUEST_METHODS.GET)(
      '/fuse_over_works',
      oRoute.controller.findAllFuse.bind(oRoute.controller)
    );
    oRoute.route(EN_REQUEST_METHODS.GET)(
      '/over_works_by_user_id',
      oRoute.controller.findAllByUserID.bind(oRoute.controller)
    );
    oRoute.route(EN_REQUEST_METHODS.GET)(
      '/over_work/:target_date',
      oRoute.controller.findByUserIDWithDate.bind(oRoute.controller)
    );
    oRoute.route(EN_REQUEST_METHODS.GET)(
      '/fuse_over_works_by_user_id',
      oRoute.controller.findAllFuseByUserID.bind(oRoute.controller)
    );
    oRoute.route(EN_REQUEST_METHODS.POST)(
      '/fuse_over_work',
      oRoute.controller.addFuseOverload.bind(oRoute.controller)
    );

    oRoute.route(EN_REQUEST_METHODS.POST)(
      '/over_works/sync_for_workers',
      oRoute.controller.addOverWorkByGroup.bind(oRoute.controller)
    );

    oRoute.route(EN_REQUEST_METHODS.POST)(
      '/over_work/sync',
      oRoute.controller.addOverWorkByUser.bind(oRoute.controller)
    );

    oRoute.route(EN_REQUEST_METHODS.POST)(
      '/use_fuse_over_work_to_vacation',
      oRoute.controller.useFuseToVacation.bind(oRoute.controller)
    );

    oRoute.route(EN_REQUEST_METHODS.GET)(
      '/fuse_over_work_to_vacations/:user_id',
      oRoute.controller.findAllFuseToVacation.bind(oRoute.controller)
    );

    oRoute.route(EN_REQUEST_METHODS.POST)(
      '/fuse_over_work_to_vacation/:group_id',
      oRoute.controller.convertFuseToVacationByGroupID.bind(oRoute.controller)
    );

    oRoute.route(EN_REQUEST_METHODS.PUT)(
      '/disable_fuse_over_work_to_vacation/:group_id',
      oRoute.controller.disableExpiredFuseToVacationByGroupID.bind(
        oRoute.controller
      )
    );

    return oRoute;
  }

  constructor(public controller: OverloadController, prefix: string) {
    super(Router(), prefix);
  }
}
