import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import debug from 'debug';

import { IRequester, TResult } from '../IRequester';
import { Requester } from '../Requester';

const log = debug('trv:AxiosRequester');
export type THTTPMethods = 'GET' | 'POST' | 'PUT' | 'DELETE';

const checkIsBrowser = () => {
  if (typeof XMLHttpRequest !== 'undefined') {
    return true;
  }
  return false;
};

export interface IAxiosRequesterConfig extends AxiosRequestConfig {
  url: string;
  method: THTTPMethods;
}

/**
 * 요청 실패시 출력되는 에러에 대한 타입 정의
 * AxiosError일 경우 status code 표시
 * 이외의 에러는 어떤 형식으로 들어올 지 모르니 data 속성에 넣어서 전달
 */
export interface IRequesterError {
  errorType: ENREQUEST_ERRORS;
  statusCode?: number;
  data: any;
}

export enum EN_REQUEST_RESULT {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum ENREQUEST_ERRORS {
  AXIOS = 'AXIOS',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

export class AxiosRequester extends Requester
  implements IRequester<IAxiosRequesterConfig> {
  constructor(public url: string) {
    super(url);
  }

  public async call<Payload>(
    config: IAxiosRequesterConfig
  ): Promise<TResult<IRequesterError, Payload>> {
    this.onStart();
    try {
      log('call', this.url);
      const isBrowser = checkIsBrowser();
      if (isBrowser) {
        config.headers = {
          ...config.headers,
          'X-Requested-With': 'XMLHttpRequest'
        };
      }

      const result: AxiosResponse<Payload> = await axios(config);

      return {
        type: EN_REQUEST_RESULT.SUCCESS,
        statusCode: result.status,
        payload: result.data
      };
    } catch (error) {
      log('call error', error);
      log('currnet config', config);

      // 서버로부터 에러가 내려온 경우
      if (error.response) {
        const errResponse = error.response;

        return {
          type: EN_REQUEST_RESULT.ERROR,
          statusCode: errResponse.status,
          error: {
            errorType: ENREQUEST_ERRORS.AXIOS,
            statusCode: errResponse.status,
            data: errResponse.data
          }
        };
      }

      // Client 요청 에러 (XMLHttpRequest Error)
      if (error.request) {
        return {
          type: EN_REQUEST_RESULT.ERROR,
          statusCode: 400,
          error: {
            errorType: ENREQUEST_ERRORS.CLIENT,
            data: error.request.statusText || 'Client Request Error'
          }
        };
      }

      // Unknown Error
      return {
        type: EN_REQUEST_RESULT.ERROR,
        statusCode: 400,
        error: {
          errorType: ENREQUEST_ERRORS.UNKNOWN,
          data: error.message
        }
      };
    } finally {
      this.onEnd();
    }
  }
}
