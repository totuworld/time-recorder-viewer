import { EN_WORK_TYPE } from './EN_WORK_TYPE';

export interface ITimeRecordLogData {
  refKey: string;
  time: string;
  type: EN_WORK_TYPE;
  done?: string;
  fuseKey?: string;
}
