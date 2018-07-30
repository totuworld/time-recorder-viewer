import { THTTPMethods } from '../requesters/AxiosRequester';

interface HTTPParams {
  query?: { [key: string]: any };
  body?: { [key: string]: any };
}

/**
 * RequestBuilder 클래스에서 요청을 만들 때 받아야 하는 인터페이스 정의
 * Resource(R), Query(Q) 에 대한 타입은 직접 정의하여 삽입하여 코드의 문서화를 도움
 *
 * @property method HTTP 메서드 정의
 * @property resources RESTful 리소스 URL을 형성할 때 사용하는 요소 /uesrs/:id 에서 'id' 에 해당
 * @property body POST Body
 * @property query GET 메서드에 사용하는 쿼리 패러매터
 * @property headers AxiosRequestConfig에 들어가는 headers와 동일.
 */
export interface RequestParams<R = {}, Q extends HTTPParams = {}> {
  method: THTTPMethods;
  resources?: { [P in keyof R]: R[P] };
  query?: { [P in keyof Q['query']]: Q['query'][P] };
  body?: { [P in keyof Q['body']]: Q['body'][P] };
  headers: {
    'access-token'?: string;
    [key: string]: any;
  };
}
