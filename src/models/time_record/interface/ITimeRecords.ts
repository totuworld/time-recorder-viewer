import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';
import { ITimeRecordLogData } from './ITimeRecordLogData';

export interface ITimeRecords {
  type: EN_REQUEST_RESULT;
  data: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>;
}

export interface IAddTimeRecord {
  type: EN_REQUEST_RESULT;
  data: {
    text: string | null;
  };
}

export interface IUpdateTimeRecord {
  type: EN_REQUEST_RESULT;
}