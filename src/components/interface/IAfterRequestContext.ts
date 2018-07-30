import * as express from 'express';
import { match } from 'react-router-dom';

import { IWrapRequest } from '../../IServer';

export interface IAfterRequestContext<P> {
  req?: IWrapRequest;
  res?: express.Response;
  /** react router 4의 match */
  match: match<P>;
  /** react router 4의 history */
  history: any;
  /** react router 4의 locaton(client에서만 지원) */
  location: any;
}
