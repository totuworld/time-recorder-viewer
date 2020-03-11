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
      headers: {}
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

  public async addMember(args: {
    group_id: string;
    user_id: string;
    manager_id: string;
  }) {
    const query = this.rb.addMemberQuery({
      method: 'POST',
      resources: {
        group_id: args.group_id,
        user_id: args.user_id
      },
      body: {
        manager_id: args.manager_id
      },
      headers: {}
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<boolean>(query);

    const result = await response;
    if (result.statusCode === 204 || result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: false };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async deleteMember(args: {
    group_id: string;
    user_id: string;
    manager_id: string;
  }) {
    const query = this.rb.addMemberQuery({
      method: 'DELETE',
      resources: {
        group_id: args.group_id,
        user_id: args.user_id
      },
      body: {
        manager_id: args.manager_id
      },
      headers: {}
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<boolean>(query);

    const result = await response;
    if (result.statusCode === 204 || result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: false };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async deleteGroup(args: { group_id: string }) {
    const query = this.rb.deleteGroupQuery({
      method: 'DELETE',
      resources: {
        group_id: args.group_id
      },
      headers: {}
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<boolean>(query);

    const result = await response;
    if (result.statusCode !== 200) {
      return { type: EN_REQUEST_RESULT.ERROR, data: false };
    }
    return { type: EN_REQUEST_RESULT.SUCCESS, data: true };
  }

  public async addGroup(args: {
    group_id: string;
    name: string;
    desc: string;
  }) {
    const query = this.rb.addGroupQuery({
      method: 'POST',
      body: args,
      headers: {}
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<boolean>(query);

    const result = await response;
    if (result.statusCode !== 200) {
      return { type: EN_REQUEST_RESULT.ERROR, data: false };
    }
    return { type: EN_REQUEST_RESULT.SUCCESS, data: true };
  }
}
