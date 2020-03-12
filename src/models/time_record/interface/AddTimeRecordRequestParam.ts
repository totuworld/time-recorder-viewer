import { EN_WORK_TYPE } from './EN_WORK_TYPE';

export interface AddTimeRecordRequestParam {
  body: {
    auth_user_id: string;
    user_id: string;
    type: EN_WORK_TYPE;
    target_date?: string;
    time?: string;
  };
}

export interface RemoveTimeRecordRequestParam {
  body: {
    auth_user_id: string;
    user_id: string;
    /** 삭제 대상 워크로그가 포함된 날짜 */
    target_date: string;
    /** 삭제 대상 워크로그 id */
    log_id: string;
    fuseKey?: string;
  };
}
