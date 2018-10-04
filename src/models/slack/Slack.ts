import debug from 'debug';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { ISlackResponse } from './interface/ISlackResponse';
import { SendMessageToUserRequestParam } from './interface/SendMessageToUserRequestParam';
import { SlackRequestBuilder } from './SlackRequestBuilder';

const log = debug('trv:Slack');

export class Slack {
  constructor(private rb: SlackRequestBuilder) {}

  public async sendQueueMessageToUser(
    params: SendMessageToUserRequestParam,
    schema: IJSONSchemaType,
  ) {
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.sendMessageToUser({
      method: 'POST',
      headers: {},
      query: params.query,
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<ISlackResponse>(query);

    const result = await response;
    log(result);
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }
}
