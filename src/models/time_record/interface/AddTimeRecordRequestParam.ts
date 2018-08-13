import { EN_WORK_TYPE_COMMAND_TITLE } from './EN_WORK_TYPE';

export interface AddTimeRecordRequestParam {
  body: {
    user_id: string;
    text: EN_WORK_TYPE_COMMAND_TITLE;
  };
}
