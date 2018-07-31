import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'normalize.css/normalize.css';

import debug from 'debug';
import { observer } from 'mobx-react';
import * as moment from 'moment';
import React from 'react';

import { DateRange, DateRangeInput } from '@blueprintjs/datetime';

import { ITimeRecordLogData } from '../../models/time_record/interface/ITimeRecordLogData';
import {
    GetTimeRecordsJSONSchema
} from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { TimeRecord } from '../../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../../models/time_record/TimeRecordRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import TimeRecordStore from '../../stores/TimeRecordStore';
import { IAfterRequestContext } from '../interface/IAfterRequestContext';

const log = debug('trv:recordContainer');

interface IRecordContainerProps {
  userId: string;
  records: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>;
  initialStartDate: string;
  initialEndDate: string;
}

interface IRecordContainerStates {
  startDate: Date;
  endDate: Date;
}

@observer
class RecordContainer extends React.Component<IRecordContainerProps, IRecordContainerStates> {
  private store: TimeRecordStore;

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
      userId: match.params.user_id,
      records: actionResp.type === EN_REQUEST_RESULT.SUCCESS ? actionResp.data : [],
      initialStartDate: startDate,
      initialEndDate: endDate,
    };
  }

  public constructor(props: IRecordContainerProps) {
    super(props);

    this.state = {
      startDate: moment(props.initialStartDate).toDate(),
      endDate: moment(props.initialEndDate).toDate(),
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.handleClosePopover = this.handleClosePopover.bind(this);
    this.store = new TimeRecordStore(props.records);
  }

  public onDatesChange([ startDate, endDate ]: DateRange) {
    const updateObj = {
      ...this.state,
    };
    if (!!startDate) {
      updateObj['startDate'] = startDate;
    }
    if (!!endDate) {
      updateObj['endDate'] = endDate;
    }
    this.setState(updateObj);
  }

  public async handleClosePopover() {
    if (this.store.isIdle === true) {
      await this.store.findTimeRecord(
        this.props.userId,
        moment(this.state.startDate).format('YYYY-MM-DD'),
        moment(this.state.endDate).format('YYYY-MM-DD'),
      );
    }
  }

  public render() {
    return (
      <div>
        <h1>hi</h1>
        <DateRangeInput
          shortcuts={false}
          allowSingleDayRange={true}
          formatDate={(date) => !!date ? moment(date).format('YYYY-MM-DD') : ''}
          onChange={this.onDatesChange}
          parseDate={(str) => new Date(str)}
          value={[this.state.startDate, this.state.endDate]}
          closeOnSelection={false}
          popoverProps={{onClosed: this.handleClosePopover}}
          minDate={new Date('2018-07-01')}
          maxDate={new Date()}
        />
      </div>
    );
  }
}

export default RecordContainer;
