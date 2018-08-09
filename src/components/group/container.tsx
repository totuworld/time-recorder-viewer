import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@coreui/icons/css/coreui-icons.min.css';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
// import 'normalize.css/normalize.css';
import '../../styles/style.css';

import debug from 'debug';
import * as luxon from 'luxon';
import { observer } from 'mobx-react';
import moment from 'moment';
import React from 'react';
import { DateRangePicker } from 'react-dates';
import { Helmet } from 'react-helmet';
import {
    Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, Row, Table
} from 'reactstrap';

import { DateRange } from '@blueprintjs/datetime';

import { ITimeRecordLogData } from '../../models/time_record/interface/ITimeRecordLogData';
import {
    GetTimeRecordsJSONSchema
} from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { TimeRecord } from '../../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../../models/time_record/TimeRecordRequestBuilder';
import { IUserInfo } from '../../models/user/interface/IUserInfo';
import {
    GetGroupUserInfosJSONSchema
} from '../../models/user/JSONSchema/GetGroupUserInfosJSONSchema';
import { User } from '../../models/user/User';
import { UserRequestBuilder } from '../../models/user/UserRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import GroupStore from '../../stores/GroupStore';
import { IAfterRequestContext } from '../interface/IAfterRequestContext';
import { IRecordContainerStates } from '../record/container';
import GroupUserAvatar from './user/avatar';

export interface IGroupContainerProps {
  groupId: string;
  group: IUserInfo[];
  records: {[key: string]: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>};
  initialStartDate: string;
  initialEndDate: string;
}

const log = debug('trv:GroupContainer');

@observer
export default class GroupContainer extends React.Component<IGroupContainerProps, IRecordContainerStates> {
  private store: GroupStore;
  public static async getInitialProps({
    req,
    res,
    match
  }: IAfterRequestContext<{ group_id: string }>) {
    log(match.params.group_id);
    log(!!req && !!req.config);
    let rbParam: RequestBuilderParams = { isProxy: true };
    if (!!req && !!req.config) {
      rbParam = { baseURI: req.config.getApiURI(), isProxy: false };
    }

    const weekStartDay = luxon.DateTime.local().set({weekday: 1}).minus({days: 1}).toFormat('yyyy-LL-dd');
    const weekEndDay = luxon.DateTime.local().set({weekday: 6}).toFormat('yyyy-LL-dd');
    let startDate = weekStartDay;
    let endDate = weekEndDay;
    if (!!req && !!req.query) {
      startDate = !!req.query['startDate'] ? req.query['startDate'] : weekStartDay;
      endDate = !!req.query['endDate'] ? req.query['endDate'] : weekEndDay;
    }
    const checkParams = {
      query: {
        groupId: match.params.group_id,
      }
    };

    const rb = new UserRequestBuilder(rbParam);
    const action = new User(rb);

    const actionResp = await action.findGroups(
      checkParams,
      GetGroupUserInfosJSONSchema,
    );
    const records = {};
    log('actionResp.type: ', actionResp.type);
    if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
      log('actionResp.type: ', actionResp.type);
      // 각 사용자의 일한 시간도 뽑아내자.
      const promises = actionResp.data.map(async (mv, i) => {
        const trRb = new TimeRecordRequestBuilder(rbParam);
        const trAction = new TimeRecord(trRb);
        const resp = await trAction.findAll({query: { userId: mv.id, startDate, endDate }}, GetTimeRecordsJSONSchema);
        log(resp.data);
        records[mv.id] = !!resp && resp.type === EN_REQUEST_RESULT.SUCCESS ? resp.data : [];
      });
      while (promises.length > 0) {
        await promises.pop();
      }
    }
    
    return {
      groupId: match.params.group_id,
      group: actionResp.type === EN_REQUEST_RESULT.SUCCESS ?
        actionResp.data.sort((a, b) => a.real_name > b.real_name ? 1 : -1) : [],
      records,
      initialStartDate: startDate,
      initialEndDate: endDate,
    };
  }

  constructor(props: IGroupContainerProps) {
    super(props);

    this.state = {
      startDate: moment(props.initialStartDate).toDate(),
      endDate: moment(props.initialEndDate).toDate(),
      focusedInput: null,
      backupDate: { start: null, end: null }
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onDatesChangeForDRP = this.onDatesChangeForDRP.bind(this);
    this.handleClosePopover = this.handleClosePopover.bind(this);
    this.handleClickRow = this.handleClickRow.bind(this);
    this.getRows = this.getRows.bind(this);
    this.store = new GroupStore(props.records, props.group);
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
  public onDatesChangeForDRP({ startDate, endDate }: {
    startDate: moment.Moment | null, endDate: moment.Moment | null}) {
    const updateObj = {
      ...this.state,
    };
    if (!!startDate) {
      updateObj['startDate'] = startDate.toDate();
      updateObj.focusedInput = 'endDate';
    }
    if (!!endDate) {
      updateObj['endDate'] = endDate.toDate();
    }
    this.setState(updateObj);
  }

  public async handleClosePopover() {
    if (this.store.isIdle === true) {
      await this.store.findGroupRecords(
        moment(this.state.startDate).format('YYYY-MM-DD'),
        moment(this.state.endDate).format('YYYY-MM-DD'),
      );
    }
  }

  public handleClickRow(userId: string) {
    const haveData = !!this.store.Records[userId] && this.store.Records[userId].length > 0;
    if (haveData === true) {
      const startDate = luxon.DateTime.fromJSDate(this.state.startDate).toFormat('yyyy-LL-dd');
      const endDate = luxon.DateTime.fromJSDate(this.state.endDate).toFormat('yyyy-LL-dd');
      window.location.href = `/records/${userId}?startDate=${startDate}&endDate=${endDate}`;
    }
  }

  public getRows() {
    return this.props.group
    .map((mv) => {
      const convertData = !!this.store.Records[mv.id] && this.store.Records[mv.id].length > 0 ?
      TimeRecord.convertWorkTime(
        this.store.Records[mv.id],
        this.state.startDate,
        this.state.endDate,
      ) : { updateDatas: null, overTimeObj: null, calWorkTimeStr: 'none', overTimeStr: 'none' };
      const lastActive = !!convertData.updateDatas && convertData.calWorkTimeStr !== 'none' ?
        convertData.updateDatas[convertData.updateDatas.length - 1].name : 'none';
      const badgeStatus = lastActive !== 'none' && !!convertData.overTimeObj ?
        luxon.Duration.fromObject(convertData.overTimeObj).as('hours') >= 1 ? 'danger' : 'success' : null;
      return (
        <tr
          key={mv.id}
          onClick={() => { this.handleClickRow(mv.id); }}
        >
          <td className="text-center">
            <GroupUserAvatar
              key={mv.id}
              img_url={mv.profile_url}
              alt={mv.real_name}
              badge_status={badgeStatus}
            />
          </td>
          <td className="d-none d-sm-block">
            <div>{mv.real_name}</div>
            <div className="small text-muted">
              slack id: {mv.name}
            </div>
          </td>
          <td>
            {convertData.calWorkTimeStr}
          </td>
          <td>
            {convertData.overTimeStr}
          </td>
          <td>
            {lastActive}
          </td>
        </tr>
      );
    });
  }

  public render() {
    const rows = this.getRows();
    return (
      <div className="app">
        <Helmet>
          <title>Group {this.props.groupId} Work Log</title>
        </Helmet>
        <Container>
          <DateRangePicker
            startDate={moment(this.state.startDate)}
            endDate={moment(this.state.endDate)}
            startDateId="startDate"
            endDateId="endDate"
            orientation="vertical"
            focusedInput={this.state.focusedInput}
            onDatesChange={this.onDatesChangeForDRP}
            onFocusChange={(focusedInput) => this.setState({...this.state, focusedInput})}
            minimumNights={0}
            isOutsideRange={(day) => false}
            onClose={this.handleClosePopover}
          />
          <Card>
            <CardHeader>
              {this.props.groupId}
            </CardHeader>
            <CardBody>
              <Table
                responsive={true}
                className="d-sm-table"
              >
                <thead className="thead-light">
                  <tr>
                    <th className="text-center">
                      <i className="cui-people icons font-2xl" />
                    </th>
                    <th className="d-none d-sm-block">사용자</th>
                    <th>근무시간</th>
                    <th>초과시간</th>
                    <th>마지막 기록</th>
                  </tr>
                </thead>
                <tbody>
                  {rows}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Container>
      </div>
    );
  }
}