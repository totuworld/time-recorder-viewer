import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';

export interface IAddOverWork {
  type: EN_REQUEST_RESULT;
  data?: IAddOverWorkData;
}

export interface IAddOverWorkData {
  week: string;
  user_id: string;
}
