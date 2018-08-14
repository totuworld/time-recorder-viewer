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
