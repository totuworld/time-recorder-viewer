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
    Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, Row, Table
} from 'reactstrap';

import { IFuseOverWork, IOverWork } from '../../models/time_record/interface/IOverWork';
import { ITimeRecordLogData } from '../../models/time_record/interface/ITimeRecordLogData';
import {
    GetOverloadsByUserIDJSONSchema
} from '../../models/time_record/JSONSchema/GetOverloadsJSONSchema';
import {
    GetTimeRecordsJSONSchema
} from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { Overload } from '../../models/time_record/Overload';
import { OverloadRequestBuilder } from '../../models/time_record/OverloadRequestBuilder';
import { TimeRecord } from '../../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../../models/time_record/TimeRecordRequestBuilder';
import { IUserInfo } from '../../models/user/interface/IUserInfo';
import {
    GetGroupUserInfosJSONSchema
} from '../../models/user/JSONSchema/GetGroupUserInfosJSONSchema';
import { User } from '../../models/user/User';
import { UserRequestBuilder } from '../../models/user/UserRequestBuilder';
import { Auth } from '../../services/auth';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../services/util';
import GroupStore from '../../stores/GroupStore';
import LoginStore from '../../stores/LoginStore';
import DefaultHeader from '../common/DefaultHeader';
import { IAfterRequestContext } from '../interface/IAfterRequestContext';
import { IRecordContainerStates } from '../record/container';
import GroupUserAvatar from './user/avatar';

export interface IGroupContainerProps {
  groupId: string;
  group: IUserInfo[];
  records: {[key: string]: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>};
  overloads: {[key: string]: IOverWork[]};
  fuseOverloads: {[key: string]: IFuseOverWork[]};
  initialStartDate: string;
  initialEndDate: string;
}

const log = debug('trv:GroupContainer');

@observer
export default class GroupContainer extends React.Component<IGroupContainerProps, IRecordContainerStates> {
  private store: GroupStore;
  private loginUserStore: LoginStore;
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
    const overloads = {};
    const fuseOverloads = {};
    log('actionResp.type: ', actionResp.type);
    if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
      log('actionResp.type: ', actionResp.type);
      const trRb = new TimeRecordRequestBuilder(rbParam);
      const trAction = new TimeRecord(trRb);
      const olRb = new OverloadRequestBuilder(rbParam);
      const olAction = new Overload(olRb);
      // 각 사용자의 일한 시간도 뽑아내자.
      const promises = actionResp.data.map(async (mv, i) => {
        const resp = await trAction.findAll({query: { userId: mv.id, startDate, endDate }}, GetTimeRecordsJSONSchema);
        log(resp.data);
        records[mv.id] = !!resp && resp.type === EN_REQUEST_RESULT.SUCCESS ? resp.data : [];
        const olQuery = { query: {user_id: mv.id} };
        const olResp = await olAction.findAllByUserID(olQuery, GetOverloadsByUserIDJSONSchema);
        overloads[mv.id] = !!olResp && olResp.type === EN_REQUEST_RESULT.SUCCESS ? olResp.data : [];
        const olFuseResp = await olAction.findAllFuseUserID(olQuery, GetOverloadsByUserIDJSONSchema);
        fuseOverloads[mv.id] = !!olFuseResp && olFuseResp.type === EN_REQUEST_RESULT.SUCCESS ? olFuseResp.data : [];
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
      overloads,
      fuseOverloads,
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
      backupDate: { start: null, end: null },
      isServer: true,
    };

    this.onDatesChangeForDRP = this.onDatesChangeForDRP.bind(this);
    this.handleClosePopover = this.handleClosePopover.bind(this);
    this.handleClickRow = this.handleClickRow.bind(this);
    this.getTimeObjectToString = this.getTimeObjectToString.bind(this);
    this.getRows = this.getRows.bind(this);
    this.calGroupWorkTime = this.calGroupWorkTime.bind(this);
    this.getDataElements = this.getDataElements.bind(this);
    this.isLogined = this.isLogined.bind(this);
    this.store = new GroupStore(props.records, props.group, props.overloads, props.fuseOverloads);
    this.loginUserStore = new LoginStore(null);
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

  public getTimeObjectToString(totalRemainDurationObj: luxon.DurationObject) {
    let duration = luxon.Duration.fromObject(totalRemainDurationObj);
    const milliseconds = duration.as('milliseconds');
    if (milliseconds < 0) {
      duration = luxon.Duration.fromMillis(Math.abs(milliseconds));
    }
    return milliseconds < 0 ? `-${duration.toFormat('hh:mm:ss')}` : duration.toFormat('hh:mm:ss');
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
      const totalRemain = Util.totalRemain(this.store.OverWorks[mv.id], this.store.FuseOverWorks[mv.id]);
      const totalRemainStr = totalRemain === null ? '-' : this.getTimeObjectToString(totalRemain);
      const totalRemainBtn = totalRemain === null ? '-' :
        (<Button
          onClick={(e) => { e.stopPropagation(); window.location.href = `/overload/${mv.id}`; }}
        >
          {totalRemainStr}
        </Button>);
      return (
        <tr
          key={mv.id}
          onClick={() => { this.handleClickRow(mv.id); }}
          style={{cursor: 'pointer'}}
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
            {totalRemainBtn}
          </td>
        </tr>
      );
    });
  }

  public calGroupWorkTime() {
    function getMedian(numbers: number[]) {
      const numsLen = numbers.length;
      const sortNumbers = numbers.sort();

      if (numsLen % 2 === 0) {
        return (sortNumbers[numsLen / 2 - 1] + sortNumbers[numsLen / 2]) / 2;
      }
      return sortNumbers[(numsLen - 1) / 2];
    }
    const workTimeValues = {
      totalWorkTime: luxon.Duration.fromObject({}),
      totalOverWorkTime: luxon.Duration.fromObject({}),
      averageOverWorkTime: luxon.Duration.fromObject({}),
      medianOverWorkTime: luxon.Duration.fromObject({}),
    };
    // record 데이터가 비어있다면 기본 값을 바로 리턴한다.
    if (Util.isEmpty(this.store.Records)) {
      return workTimeValues;
    }
    const filterOutEmptyWorklog = Object.values(this.store.Records)
      .filter((fv) => Util.isNotEmpty(fv));
    const workTimeObjs = filterOutEmptyWorklog
      .map((mv) => TimeRecord.convertWorkTime(mv, this.state.startDate, this.state.endDate));
    const reduceTimes = workTimeObjs.reduce(
      (acc, cur) => {
        const updateAcc = {...acc};
        updateAcc.totalWorkTime += luxon.Duration.fromObject(cur.calWorkTimeObj).as('milliseconds');
        const overtime = luxon.Duration.fromObject(cur.overTimeObj).as('milliseconds');
        updateAcc.totalOverWorkTime += overtime;
        return updateAcc;
      },
      { totalWorkTime: 0, totalOverWorkTime: 0 });
    workTimeValues.totalWorkTime = luxon.Duration.fromMillis(reduceTimes.totalWorkTime);
    workTimeValues.totalOverWorkTime = luxon.Duration.fromMillis(reduceTimes.totalOverWorkTime);
    workTimeValues.averageOverWorkTime = luxon.Duration.fromMillis(reduceTimes.totalOverWorkTime / workTimeObjs.length);
    workTimeValues.medianOverWorkTime = luxon.Duration.fromMillis(
      getMedian(workTimeObjs.map((mv) =>  luxon.Duration.fromObject(mv.overTimeObj).as('milliseconds'))));
    return workTimeValues;
  }

  public getDataElements() {
    const workTimeValues = this.calGroupWorkTime();
    return (
      <Row>
        <Col md={true} className="mb-sm-2 mb-0">
          <div className="callout callout-primary">
            <div className="text-muted">{workTimeValues.totalWorkTime.toFormat('hh:mm:ss')}</div>
            <div>총 근무 시간</div>
          </div>
        </Col>
        <Col md={true} className="mb-sm-2 mb-0">
          <div className="callout callout-danger">
            <div className="text-muted">{workTimeValues.totalOverWorkTime.toFormat('hh:mm:ss')}</div>
            <div>총 초과근무</div>
          </div>
        </Col>
        <Col md={true} className="mb-sm-2 mb-0">
          <div className="callout callout-primary">
            <div className="text-muted">{workTimeValues.averageOverWorkTime.toFormat('hh:mm:ss')}</div>
            <div>평균 초과근무</div>
          </div>
        </Col>
        <Col md={true} className="mb-sm-2 mb-0">
          <div className="callout callout-warning">
            <div className="text-muted">{workTimeValues.medianOverWorkTime.toFormat('hh:mm:ss')}</div>
            <div>초과근무 중위값</div>
          </div>
        </Col>
      </Row>
    );
  }

  public isLogined() {
    if (this.state.isServer === true) {
      return false;
    }
    return this.loginUserStore.isLogin;
  }

  public async componentDidMount() {
    this.setState({
      ...this.state,
      isServer: false,
    });
    console.log(Auth.isLogined);
    console.log(!!Auth.loginUserKey);
    if (Auth.isLogined === true && !!Auth.loginUserKey) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
    }
  }

  public render() {
    const rows = this.getRows();
    const dataElements = this.getDataElements();
    return (
      <div className="app">
        <Helmet>
          <title>Group {this.props.groupId} Work Log</title>
        </Helmet>
        <DefaultHeader
          isLogin={this.isLogined()}
          userInfo={this.loginUserStore.UserInfo}
          onClickLogin={() => { window.location.href = '/login'; }}
          onClickLogout={() => { this.loginUserStore.logout(this.state.isServer); }}
        />
        <div className="app-body">
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
                  hover={true}
                >
                  <thead className="thead-light">
                    <tr>
                      <th className="text-center">
                        <i className="cui-people icons font-2xl" />
                      </th>
                      <th className="d-none d-sm-block">사용자</th>
                      <th>근무시간</th>
                      <th>기간 내 초과시간</th>
                      <th>누적 초과시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows}
                  </tbody>
                </Table>
              </CardBody>
              <CardFooter>
                {dataElements}
              </CardFooter>
            </Card>
          </Container>
        </div>
      </div>
    );
  }
}