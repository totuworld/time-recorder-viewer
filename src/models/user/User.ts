import debug from 'debug';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { GroupsFindRequestParam } from './interface/GroupsFindRequestParam';
import { IUserInfo } from './interface/IUserInfo';
import { UserFindRequestParam } from './interface/UserFindRequestParam';
import { UserRequestBuilder } from './UserRequestBuilder';

const log = debug('trv:User');

export class User {
  constructor(private rb: UserRequestBuilder) {}

  public async find(
    params: UserFindRequestParam,
    schema: IJSONSchemaType,
  ) {
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

  public async findGroups(
    params: GroupsFindRequestParam,
    schema: IJSONSchemaType,
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
}