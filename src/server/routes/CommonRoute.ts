import * as BodyParser from 'body-parser';
import * as debug from 'debug';
import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';

export enum EN_REQUEST_METHODS {
  ALL = 'all',
  GET = 'get',
  DELETE = 'delete',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  OPTIONS = 'options',
  HEAD = 'head',
}
export type TPathParams = string | RegExp | Array<string | RegExp>;
export type TRouteMethod = EN_REQUEST_METHODS;

const log = debug('trv:CommonRoute');

export class CommonRoute {
  public router: Router;
  protected prefix: string;
  constructor(router: Router, prefix: string) {
    this.router = router;
    this.prefix = prefix;
  }

  public route(method: TRouteMethod): (path: TPathParams, ...handlers: RequestHandler[]) => Router {
    return (path: TPathParams, ...handlers: RequestHandler[]): Router => {
      handlers[handlers.length - 1] = this.wrapHandler(handlers[handlers.length - 1]);

      return this.router[method].apply(this.router, [
        this.prefix + path,
        ...[BodyParser.urlencoded({ extended: false }), BodyParser.json(), ...handlers],
      ]);
    };
  }

  public wrapHandler(handler: RequestHandler) {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
      try {
        log('handler', 'excuted');
        const ret = await handler(req, res, next);
        log('handler', 'excuted return', ret);

        if (ret === null || ret === undefined) {
          next();
        }

        if (ret.type === EN_REQUEST_RESULT.ERROR) {
          log('handler', 'error recieved');
          return res.status(ret.status).json(ret.error);
        }

        log('handler', 'handled successfully');
        return res.status(ret.status).json(ret.payload);
      } catch (error) {
        log('error', error.message);
        return res.status(500);
      }
    };
  }
}