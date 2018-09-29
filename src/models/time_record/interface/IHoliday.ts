import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';

export interface IHoliday {
  date: string;
  name: string;
}

export interface IHolidayBox {
  type: EN_REQUEST_RESULT;
  data: IHoliday[];
}