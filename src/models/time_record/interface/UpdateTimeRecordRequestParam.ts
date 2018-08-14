import { ITimeRecordLogData } from './ITimeRecordLogData';

export interface UpdateTimeRecordRequestParam {
  body: {
    auth_user_id: string;
    user_id: string;
    update_date: string;
    record_key: string;
    target_key: keyof ITimeRecordLogData,
    time: string;
  };
}
