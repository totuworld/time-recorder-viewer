import {
  EN_REQUEST_RESULT,
  IRequesterError
} from './requesters/AxiosRequester';

export type TResult<Err, Payload> =
  | { type: EN_REQUEST_RESULT.ERROR; statusCode: number; error: Err }
  | { type: EN_REQUEST_RESULT.SUCCESS; statusCode: number; payload: Payload };

export interface Headers {
  [key: string]: string;
}

export interface Options {
  headers?: Headers;
  timeout?: number;
}

export interface Body {
  [key: string]: any;
}

export interface RequestConfig {
  url: string;
}

// export interface IRequest {}
export interface IRequester<T> {
  call<Payload>(
    config: RequestConfig
  ): Promise<TResult<IRequesterError, Payload>>;
}
