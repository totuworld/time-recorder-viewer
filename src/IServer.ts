import * as express from 'express';

import { ConfigType } from './config/Config';

export interface IWrapRequest extends express.Request {
  config: ConfigType;
}
