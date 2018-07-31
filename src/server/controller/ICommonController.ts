import {
    EN_REQUEST_RESULT, IRequesterError
} from '../../services/requestService/requesters/AxiosRequester';

export type TResp<E, P> = {
  status: number;
  type: EN_REQUEST_RESULT;
  error?: E;
  payload?: P;
};

export type TErrorResp = {
  status?: number;
  code: string;
  message: string;
};

export type TControllerResp<T> = Express.Response | TResp<IRequesterError, T> | void;
