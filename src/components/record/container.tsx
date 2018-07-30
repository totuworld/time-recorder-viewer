import debug from 'debug';
import * as moment from 'moment';
import React from 'react';
import { DateRangePicker } from 'react-dates';

import { ITimeRecordLogData } from '../../models/time_record/interface/ITimeRecordLogData';
import {
    GetTimeRecordsJSONSchema
} from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { TimeRecord } from '../../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../../models/time_record/TimeRecordRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { IAfterRequestContext } from '../interface/IAfterRequestContext';

const log = debug('trv:recordContainer');

interface IRecordContainerProps {
  records: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>;
  initialStartDate: string;
  initialEndDate: string;
}

class RecordContainer extends React.Component<IRecordContainerProps> {
  public static async getInitialProps({
    req,
    res,
    match
  }: IAfterRequestContext<{ user_id: string }>) {
    log(match.params.user_id);
    log(!!req && !!req.config);
    let rbParam: RequestBuilderParams = { isProxy: true };
    if (!!req && !!req.config) {
      rbParam = { baseURI: req.config.getApiURI(), isProxy: false };
    }
    const today = moment().format('YYYY-MM-DD');
    let startDate = today;
    let endDate = today;
    if (!!req && !!req.query) {
      startDate = !!req.query['startDate'] ? req.query['startDate'] : today;
      endDate = !!req.query['endDate'] ? req.query['endDate'] : today;
    }
    const checkParams = {
      query: {
        userId: match.params.user_id,
        startDate,
        endDate,
      }
    };

    const rb = new TimeRecordRequestBuilder(rbParam);
    const action = new TimeRecord(rb);

    const actionResp = await action.findAll(
      checkParams,
      GetTimeRecordsJSONSchema,
    );
    
    return {
      records: actionResp,
      initialStartDate: startDate,
      initialEndDate: endDate,
    };
  }

  public constructor(props: IRecordContainerProps) {
    super(props);
  }

  public render() {
    return (
      <div>
        <h1>hi</h1>
      </div>
    );
  }
}

export default RecordContainer;
