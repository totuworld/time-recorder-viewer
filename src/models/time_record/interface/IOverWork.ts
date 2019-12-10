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

/** OverTime을 휴가로 변경한 기록에 관한 인터페이스 */
export interface IFuseToVacation {
  /** 생성 날짜 luxon (yyyyLLdd) */
  created: string;
  /** 만료일자 (ISO 8601) */
  expireDate: string;
  /** 변경한 사유 */
  note: string;
  /** 사용 여부 */
  used: boolean;

  /** 사용한 시간 */
  useTimeStamp?: string;
  /** 해당 휴가를 추가한 날짜 */
  addLogDate?: string;

  /** 시스템 만료(혹은 관리자 만료) 사유 */
  expireNote?: string;
  /** 시스템 만료(혹은 관리자 만료)가 실행된 시각 */
  expireByAdminTimeStamp?: string;
}

export interface IFuseToVacationRead extends IFuseToVacation {
  /** 고유키 */
  key: string;
}

export interface IUseFuseToVacation {
  type: EN_REQUEST_RESULT;
  data?: {
    result: boolean;
  };
}

export interface IFindAllFuseToVacation {
  type: EN_REQUEST_RESULT;
  data?: IFuseToVacationRead[];
}
