import debug from 'debug';

import RequestService from '../../services/requestService';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { GroupRequestBuilder } from './GroupRequestBuilder';
import { IGroupInfo } from './interface/IGroupInfo';

const log = debug('trv:Group');

export class Group {
  constructor(private rb: GroupRequestBuilder) {}

  public async findAllGroupInfos() {

    const query = this.rb.createGetAllGroupInfosQuery({
      method: 'GET',
      headers: {},
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IGroupInfo[]>(query);

    const result = await response;
    if (result.statusCode === 204 || result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }
}