import { RequestParams } from '../../services/requestService/interface/IRequestParams';
import {
  RequestBuilder,
  RequestBuilderParams
} from '../../services/requestService/RequestBuilder';
import { IAxiosRequesterConfig } from '../../services/requestService/requesters/AxiosRequester';

export class GroupRequestBuilder extends RequestBuilder {
  constructor(queryParams?: RequestBuilderParams) {
    super(queryParams);
  }

  public getAPIPath(path: string) {
    const pathname = path.startsWith('/') ? path : `/${path}`;

    return this.baseURI.equals('') || this.isProxy
      ? this.baseURI.path(`/api${pathname}`)
      : this.baseURI.path(pathname);
  }

  public createGetAllGroupInfosQuery({
    method,
    query
  }: RequestParams<{}, {}>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/get_group_infos');
    let endPoint = apiPath.href();
    if (!!query) {
      const reqQueryStr = Object.keys(query)
        .reduce((acc: string[], cur) => {
          if (!!query[cur]) {
            acc.push(`${cur}=${query[cur]}`);
          }
          return acc;
        }, [])
        .join('&');
      endPoint = `${endPoint}?${reqQueryStr}`;
    }

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 20000,
      url: endPoint
    };
  }

  public addMemberQuery({
    method,
    resources,
    body
  }: RequestParams<
    { group_id: string; user_id: string },
    { body: { manager_id: string } }
  >): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath(
      `/groups/${resources!.group_id}/${resources!.user_id}`
    );
    const endPoint = apiPath.href();

    return {
      method,
      data: body,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 20000,
      url: endPoint
    };
  }
}
