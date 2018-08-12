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
    Button, Card, CardBody, CardFooter, CardHeader, Col, Container, Row, Table
} from 'reactstrap';

import { EN_WORK_TITLE_KR } from '../../models/time_record/interface/EN_WORK_TYPE';
import { ITimeRecordLogData } from '../../models/time_record/interface/ITimeRecordLogData';
import {
    GetTimeRecordsJSONSchema
} from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { TimeRecord } from '../../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../../models/time_record/TimeRecordRequestBuilder';
import { IUserInfo } from '../../models/user/interface/IUserInfo';
import { GetUserInfoJSONSchema } from '../../models/user/JSONSchema/GetUserInfoJSONSchema';
import { User } from '../../models/user/User';
import { UserRequestBuilder } from '../../models/user/UserRequestBuilder';
import { Auth } from '../../services/auth';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../services/util';
import LoginStore from '../../stores/LoginStore';
import TimeRecordStore from '../../stores/TimeRecordStore';
import ChartBarStacked from '../chart/bar/Stacked';
import ChartBarStacked2, { IChartBarStacked2Props } from '../chart/bar/Stacked2';
import ChartPieDonut from '../chart/pie/donut';
import DefaultHeader from '../common/DefaultHeader';
import GroupUserAvatar from '../group/user/avatar';
import { IAfterRequestContext } from '../interface/IAfterRequestContext';

const log = debug('trv:recordContainer');
interface WorkStackedBarChart {
  new (): ChartBarStacked<{name: string, data: {REST: number, WORK: number, EMERGENCY: number}}>;
}
const WorkStackedBarChart = ChartBarStacked as WorkStackedBarChart;

const bgColor = [
  {targetKey: 'REST', color: '#ffc107'},
  {targetKey: 'WORK', color: '#63c2de'},
  {targetKey: 'EMERGENCY', color: '#f86c6b'}
];

interface IRecordContainerProps {
  userId: string;
  userInfo: IUserInfo | null;
  records: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>;
  initialStartDate: string;
  initialEndDate: string;
}

export interface IRecordContainerStates {
  startDate: Date;
  endDate: Date;
  focusedInput: 'startDate' | 'endDate' | null;
  backupDate: { start: Date | null, end: Date | null };
  isServer: boolean;
}

@observer
class RecordContainer extends React.Component<IRecordContainerProps, IRecordContainerStates> {
  private store: TimeRecordStore;
  private loginUserStore: LoginStore;

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
    let userInfo: IUserInfo | null = null;
    if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
      const userRb = new UserRequestBuilder(rbParam);
      const userAction = new User(userRb);
      const userInfoResp = await userAction.find(
        {query: { userId: match.params.user_id }},
        GetUserInfoJSONSchema);
      if (userInfoResp.type === EN_REQUEST_RESULT.SUCCESS) {
        userInfo = userInfoResp.data;
      }
    }
    
    return {
      userId: match.params.user_id,
      userInfo,
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
      focusedInput: null,
      backupDate: { start: null, end: null },
      isServer: false,
    };

    this.onDatesChangeForDRP = this.onDatesChangeForDRP.bind(this);
    this.handleClosePopover = this.handleClosePopover.bind(this);
    this.getAvatar = this.getAvatar.bind(this);
    this.onClickBar = this.onClickBar.bind(this);
    this.getMultipleDayElement = this.getMultipleDayElement.bind(this);
    this.getSingleDayElement = this.getSingleDayElement.bind(this);
    this.getWorkTime = this.getWorkTime.bind(this);
    this.gobackList = this.gobackList.bind(this);
    this.isLogined = this.isLogined.bind(this);
    this.store = new TimeRecordStore(props.records);
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
      await this.store.findTimeRecord(
        this.props.userId,
        moment(this.state.startDate).format('YYYY-MM-DD'),
        moment(this.state.endDate).format('YYYY-MM-DD'),
      );
    }
  }

  public getAvatar() {
    if (!!this.props.userInfo === true && this.props.userInfo !== null) {
      return (
        <Row className="justify-content-start">
          <Col className="col-sm-1">
            <GroupUserAvatar
              img_url={this.props.userInfo.profile_url}
              alt={this.props.userInfo.real_name}
              badge_status={null}
            />
          </Col>
          <Col className="col-md-6">
            <div>
              <div>{this.props.userInfo.real_name}</div>
              <div className="small text-muted">
                slack id: {this.props.userInfo.name}
              </div>
            </div>
          </Col>
        </Row>);
    }
    return <Card>none</Card>;
  }

  private async onClickBar(label: string) {
    if (/[0-9]{6}/.test(label)) {
      const target = moment(label);
      const targetDate = target.toDate();
      this.setState({
        ...this.state,
        startDate: targetDate,
        endDate: targetDate,
        backupDate: { start: this.state.startDate, end: this.state.endDate }
      });
      await this.store.findTimeRecord(
        this.props.userId,
        target.format('YYYY-MM-DD'),
        target.format('YYYY-MM-DD'),
      );
    }
  }

  public getMultipleDayElement() {
    const {
      datasets,
      calWorkTimeStr, overTimeStr, totalWorkTimeStr,
      totalEmergencyTimeStr, totalRestTimeStr, totalLawRestTimeStr
    } = this.getWorkTime();
    log(datasets.datasets[0].data);
    return (
      <>
        <Card>
          <CardBody>
            <div className="chart-wrapper">
              <ChartBarStacked2
                labels={datasets.labels}
                datasets={datasets.datasets}
                onClickBar={this.onClickBar}
              />
            </div>
          </CardBody>
          <CardFooter>
            <Row>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-primary">
                  <div className="text-muted">{calWorkTimeStr}</div>
                  <div>근무시간</div>
                </div>
              </Col>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-danger">
                  <div className="text-muted">{overTimeStr}</div>
                  <div>초과근무시간</div>
                </div>
              </Col>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-info">
                  <div className="text-muted">{totalWorkTimeStr}</div>
                  <div>일한시간</div>
                </div>
              </Col>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-warning">
                  <div className="text-muted">{totalEmergencyTimeStr}</div>
                  <div>긴급대응시간</div>
                </div>
              </Col>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-info">
                  <div className="text-muted">{totalRestTimeStr}</div>
                  <div>휴식시간</div>
                </div>
              </Col>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-info">
                  <div className="text-muted">{totalLawRestTimeStr}</div>
                  <div>법정 휴식시간</div>
                </div>
              </Col>
            </Row>
          </CardFooter>
        </Card>
      </>
    );
  }

  private getWorkTime() {
    const {
      updateDatas,
      calWorkTimeStr, overTimeStr, totalWorkTimeStr,
      totalEmergencyTimeStr, totalRestTimeStr, totalLawRestTimeStr }
      = TimeRecord.convertWorkTime(this.store.Records, this.state.startDate, this.state.endDate);
    const datasets: IChartBarStacked2Props = updateDatas.reduce(
      (acc, cur) => {
        const { name, data } = cur;
        acc.labels.push(name);
        acc.datasets[0].data.push(!!data.WORK ? data.WORK : 0);
        acc.datasets[1].data.push(!!data.REST ? data.REST : 0);
        acc.datasets[2].data.push(!!data.EMERGENCY ? data.EMERGENCY : 0);
        return acc;
      },
      {
        labels: new Array<string>(), datasets: [
          { label: 'WORK', data: new Array<number>(), backgroundColor: bgColor[1].color },
          { label: 'REST', data: new Array<number>(), backgroundColor: bgColor[0].color },
          { label: 'EMERGENCY', data: new Array<number>(), backgroundColor: bgColor[2].color },
        ]
      });
    return {
      datasets,
      calWorkTimeStr, overTimeStr, totalWorkTimeStr, totalEmergencyTimeStr, totalRestTimeStr, totalLawRestTimeStr };
  }

  private async gobackList() {
    if (!!this.state.backupDate.start && !!this.state.backupDate.end) {
      this.setState({
        ...this.state,
        startDate: this.state.backupDate.start,
        endDate: this.state.backupDate.end,
        backupDate: { start: null, end: null }
      });
      await this.store.findTimeRecord(
        this.props.userId,
        moment(this.state.backupDate.start).format('YYYY-MM-DD'),
        moment(this.state.backupDate.end).format('YYYY-MM-DD'),
      );
    }
  }

  public getSingleDayElement() {
    const covertData = this.getWorkTime();
    const labels = covertData.datasets.datasets.map((mv) => mv.label);
    const datasets = covertData.datasets.datasets.reduce(
      (acc: {data: number[], backgroundColor: string[]}, cur) => {
        acc.data = [...acc.data, ...cur.data];
        return acc;
      },
      {
        data: [],
        backgroundColor: [bgColor[1].color, bgColor[0].color, bgColor[2].color]
      });
    const haveRecord = !!this.store.Records && this.store.Records.length > 0;
    let records: JSX.Element[] | null = null;
    if (haveRecord === true) {
      const firstData = this.store.Records[0];
      const firstKey = Object.keys(firstData)[0];
      const data = firstData[firstKey];
      records = Object.keys(data).map((mv) => {
        const tData = data[mv];
        return (
          <tr key={mv}>
            <td>{EN_WORK_TITLE_KR[tData.type]}</td>
            <td>{Util.toDateTimeShort(tData.time)}</td>
            <td>{!!tData.done ? Util.toDateTimeShort(tData.done) : 'none'}</td>
          </tr>
        );
      });
    }
    return (
      <>
        <Card>
          <CardBody>
            <Row>
              <Col>
                <Button onClick={this.gobackList}>리스트로 돌아가기</Button>
                <div className="chart-wrapper">
                  <ChartPieDonut
                    labels={labels}
                    datasets={[datasets]}
                  />
                </div>
              </Col>
              <Col>
                <Table>
                  <thead className="thead-light">
                    <tr>
                      <th>type</th>
                      <th>start</th>
                      <th>end</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </>
    );
  }

  public isLogined() {
    if (this.state.isServer === true) {
      return false;
    }
    return Auth.isLogined;
  }

  public async componentDidMount() {
    this.setState({
      ...this.state,
      isServer: false,
    });
    if (Auth.isLogined === true && !!Auth.loginUserKey) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
    }
  }

  public render() {
    const diffDay = Math.abs(moment(this.state.startDate).diff(moment(this.state.endDate), 'days'));
    const renderElement = diffDay > 0 ?
      this.getMultipleDayElement() : this.getSingleDayElement();
    const avatar = this.getAvatar();
    return (
      <div className="app">
        <Helmet>
          <title>User {this.props.userId} Work Log</title>
        </Helmet>
        <DefaultHeader
          isLogin={this.isLogined()}
          userInfo={this.loginUserStore.UserInfo}
          onClickLogin={() => { window.location.href = '/login'; }}
          onClickLogout={Auth.logout}
        />
        <div className="app-body">
          <Container>
            <Card>
              <CardHeader>
                {avatar}
              </CardHeader>
              <CardBody>
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
              </CardBody>
            </Card>
            {renderElement}
          </Container>
        </div>
      </div>
    );
  }
}

export default RecordContainer;
