import debug from 'debug';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { ITimeRecordLogData } from './interface/ITimeRecordLogData';
import { TimeRecordRecordsRequestsParam } from './interface/TimeRecordRecordsRequestsParam';
import { TimeRecordRequestBuilder } from './TimeRecordRequestBuilder';

const log = debug('trv:TimeRecord');

export class TimeRecord {
  constructor(private rb: TimeRecordRequestBuilder) {}

  public async findAll(
    params: TimeRecordRecordsRequestsParam,
    schema: IJSONSchemaType,
  ): Promise<Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>> {
    log(params);
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return [];
    }
    const query = this.rb.createGetUserRecordsQuery({
      method: 'GET',
      headers: {},
      query: params.query
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<
      Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>
    >(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return [];
    }
    return result.payload;
  }
}
