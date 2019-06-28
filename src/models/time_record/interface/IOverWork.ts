import * as luxon from 'luxon';
import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';

export interface IOverWork {
  week: string;
  /** 해당 기간에 오버해서 일한 시간 */
  over?: luxon.DateObject;
  /** 사용하고 남은 시간 */
  remain?: luxon.DateObject;
}

export interface IOverWorks {
  type: EN_REQUEST_RESULT;
  data: IOverWork[];
}

export interface IOverWorkWithType {
  type: EN_REQUEST_RESULT;
  data?: IOverWork;
}

export interface IFuseOverWork {
  /** luxon (yyyyLLdd) */
  date: string;
  /** ISO 8601 duration(PT4H2M) */
  use: string;
  note?: string;
}

export interface IFuseOverWorks {
  type: EN_REQUEST_RESULT;
  data: IFuseOverWork[];
}
