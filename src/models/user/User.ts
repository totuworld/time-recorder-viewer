import debug from 'debug';
import * as luxon from 'luxon';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { AddLoginUserRequestParam } from './interface/AddLoginUserRequestParam';
import {
  AddQueueRequestBodyParam,
  AddQueueRequestParam
} from './interface/AddQueueRequestParam';
import { DeleteQueueRequestParam } from './interface/DeleteQueueRequestParam';
import { FindQueueRequestParam } from './interface/FindQueueRequestParam';
import { GroupsFindRequestParam } from './interface/GroupsFindRequestParam';
import { IAddLoginUser } from './interface/IAddLoginUser';
import { ILoginUser } from './interface/ILoginUser';
import { IQueue } from './interface/IQueue';
import { ISlackUserInfo, IUserInfo } from './interface/IUserInfo';
import { LoginUserRequestParam } from './interface/LoginUserRequestParam';
import { UserFindRequestParam } from './interface/UserFindRequestParam';
import { UserRequestBuilder } from './UserRequestBuilder';

const log = debug('trv:User');

export class User {
  constructor(private rb: UserRequestBuilder) {}

  public async find(params: UserFindRequestParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.createGetUserInfoQuery({
      method: 'GET',
      headers: {},
      query: params.query
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IUserInfo>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  /** query의 groupId 로 특정되는 그룹의 멤버 정보를 로딩 */
  public async findGroups(
    params: GroupsFindRequestParam,
    schema: IJSONSchemaType
  ) {
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }

    const query = this.rb.createGetGroupsQuery({
      method: 'GET',
      headers: {},
      query: params.query
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IUserInfo[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async addLoginUser(
    params: AddLoginUserRequestParam,
    schema: IJSONSchemaType
  ) {
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      const data: IAddLoginUser = { result: false, userKey: null };
      return { type: EN_REQUEST_RESULT.ERROR, data };
    }

    const query = this.rb.createPostLoginUserQuery({
      method: 'POST',
      headers: {},
      body: params.body
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IAddLoginUser>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return {
        type: EN_REQUEST_RESULT.ERROR,
        data: { result: false, userKey: null }
      };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async findLoginUser(
    params: LoginUserRequestParam
  ): Promise<{ type: EN_REQUEST_RESULT; data?: ILoginUser }> {
    const { user_uid } = params;
    const query = this.rb.createGetLoginUserInfoQuery({
      method: 'GET',
      headers: {},
      resources: {
        user_uid
      }
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<ILoginUser>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  /** 슬랙에 가압되어있고, work log에 auth까지 마친 사용자 그룹 조회 */
  public async findAllSlackUsers(): Promise<{
    type: EN_REQUEST_RESULT;
    data?: ISlackUserInfo[];
  }> {
    const query = this.rb.getAllSlackUserInfosQuery({
      method: 'GET',
      headers: {}
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<ISlackUserInfo[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async findQueue(
    params: FindQueueRequestParam
  ): Promise<{ type: EN_REQUEST_RESULT; data?: IQueue[] }> {
    const query = this.rb.readUserQueueQuery({
      method: 'GET',
      headers: {},
      resources: {
        authId: params.authId
      }
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IQueue[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    log(result.payload);
    return this.sortReturnValue(result);
  }

  private sortReturnValue(result: {
    type: EN_REQUEST_RESULT.SUCCESS;
    statusCode: number;
    payload: IQueue[];
  }) {
    const sortPayload = [...result.payload].sort((a, b) => {
      const aDate = luxon.DateTime.fromISO(a.created);
      const bDate = luxon.DateTime.fromISO(b.created);
      return aDate > bDate ? 1 : -1;
    });
    return { type: EN_REQUEST_RESULT.SUCCESS, data: sortPayload };
  }

  public async addQueue(
    params: AddQueueRequestParam & AddQueueRequestBodyParam
  ): Promise<{ type: EN_REQUEST_RESULT; data?: IQueue[] }> {
    const query = this.rb.addUserQueueQuery({
      method: 'POST',
      headers: {},
      resources: {
        userId: params.userId
      },
      body: params.body
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IQueue[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    log(result.payload);
    return this.sortReturnValue(result);
  }

  public async deleteQueue(
    params: DeleteQueueRequestParam
  ): Promise<{ type: EN_REQUEST_RESULT; data?: IQueue[] }> {
    const query = this.rb.deleteUserQueueQuery({
      method: 'DELETE',
      headers: {},
      resources: {
        authId: params.authId,
        key: params.key
      }
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IQueue[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    log(result.payload);
    return this.sortReturnValue(result);
  }

  public async activeAdminRole(params: { userId: string }) {
    const query = this.rb.activeAdminRoleQuery({
      method: 'PUT',
      headers: {},
      resources: {
        user_id: params.userId
      }
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IUserInfo & { auth?: number }>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async deactiveAdminRole(params: { userId: string }) {
    const query = this.rb.deactiveAdminRoleQuery({
      method: 'PUT',
      headers: {},
      resources: {
        user_id: params.userId
      }
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IUserInfo>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }
}
