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
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table
} from 'reactstrap';

import {
  EN_WORK_TITLE_KR,
  EN_WORK_TYPE
} from '../../models/time_record/interface/EN_WORK_TYPE';
import { IHoliday } from '../../models/time_record/interface/IHoliday';
import { ITimeRecordLogData } from '../../models/time_record/interface/ITimeRecordLogData';
import { GetHolidaysJSONSchema } from '../../models/time_record/JSONSchema/GetHolidaysJSONSchema';
import { GetTimeRecordsJSONSchema } from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
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
import OverloadStore from '../../stores/OverloadStore';
import TimeRecordStore from '../../stores/TimeRecordStore';
import ChartBarStacked from '../chart/bar/Stacked';
import ChartBarStacked2, {
  IChartBarStacked2Props
} from '../chart/bar/Stacked2';
import ChartPieDonut from '../chart/pie/Donut';
import DefaultHeader from '../common/DefaultHeader';
import GroupUserAvatar from '../group/user/avatar';
import { IAfterRequestContext } from '../interface/IAfterRequestContext';
import RecordButtons from './buttons';
import { floatButton } from './containerStyle';

const log = debug('trv:recordContainer');

const bgColor = [
  { targetKey: 'REST', color: '#ffc107' },
  { targetKey: 'WORK', color: '#63c2de' },
  { targetKey: 'EMERGENCY', color: '#f86c6b' },
  { targetKey: 'REMOTE', color: '#36A2EB' },
  { targetKey: 'VACATION', color: '#4caf50' }
];

interface IRecordContainerProps {
  userId: string;
  userInfo: IUserInfo | null;
  records: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>;
  initialStartDate: string;
  initialEndDate: string;
  holidays: IHoliday[];
}

export interface IRecordContainerStates {
  startDate: Date;
  endDate: Date;
  focusedInput: 'startDate' | 'endDate' | null;
  backupDate: { start: Date | null; end: Date | null };
  isServer: boolean;
}

interface IetcStates {
  isModalOpen: boolean;
  /** 차감 모달 on/off */
  isFuseModalOpen: boolean;
  /** 차감하여 휴가 변환 모달 on/off */
  isFuseToVacationModalOpen: boolean;
  updateData?: { key: string; data: ITimeRecordLogData };
  fuseHours: luxon.Duration;
  note: string;
}

@observer
class RecordContainer extends React.Component<
  IRecordContainerProps,
  IRecordContainerStates & IetcStates
> {
  private store: TimeRecordStore;
  private loginUserStore: LoginStore;
  private overloadStore: OverloadStore;

  private modalStartDateRef = React.createRef<HTMLInputElement>();
  private modalStartTimeRef = React.createRef<HTMLInputElement>();
  private modalEndDateRef = React.createRef<HTMLInputElement>();
  private modalEndTimeRef = React.createRef<HTMLInputElement>();
  private modalNoteRef = React.createRef<HTMLInputElement>();

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
    const weekStartDay = luxon.DateTime.local()
      .set({ weekday: 1 })
      .minus({ days: 1 })
      .toFormat('yyyy-LL-dd');
    const weekEndDay = luxon.DateTime.local()
      .set({ weekday: 6 })
      .toFormat('yyyy-LL-dd');
    let startDate = weekStartDay;
    let endDate = weekEndDay;
    if (!!req && !!req.query) {
      startDate = !!req.query['startDate']
        ? req.query['startDate']
        : weekStartDay;
      endDate = !!req.query['endDate'] ? req.query['endDate'] : weekEndDay;
    }
    const checkParams = {
      query: {
        userId: match.params.user_id,
        startDate,
        endDate
      }
    };

    const rb = new TimeRecordRequestBuilder(rbParam);
    const action = new TimeRecord(rb);

    const [actionResp, holidaysResp] = await Promise.all([
      action.findAll(checkParams, GetTimeRecordsJSONSchema),
      action.getHolidays(
        {
          query: {
            start_date: startDate,
            end_date: endDate
          }
        },
        GetHolidaysJSONSchema
      )
    ]);
    let userInfo: IUserInfo | null = null;
    if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
      const userRb = new UserRequestBuilder(rbParam);
      const userAction = new User(userRb);
      const userInfoResp = await userAction.find(
        { query: { userId: match.params.user_id } },
        GetUserInfoJSONSchema
      );
      if (userInfoResp.type === EN_REQUEST_RESULT.SUCCESS) {
        userInfo = userInfoResp.data;
      }
    }

    return {
      userId: match.params.user_id,
      userInfo,
      records:
        actionResp.type === EN_REQUEST_RESULT.SUCCESS ? actionResp.data : [],
      initialStartDate: startDate,
      initialEndDate: endDate,
      holidays:
        holidaysResp.type === EN_REQUEST_RESULT.SUCCESS ? holidaysResp.data : []
    };
  }

  public constructor(props: IRecordContainerProps) {
    super(props);

    this.state = {
      startDate: moment(props.initialStartDate).toDate(),
      endDate: moment(props.initialEndDate).toDate(),
      focusedInput: null,
      backupDate: { start: null, end: null },
      isServer: true,
      isModalOpen: false,
      isFuseModalOpen: false,
      isFuseToVacationModalOpen: false,
      fuseHours: luxon.Duration.fromObject({ hours: 0 }),
      note: ''
    };

    this.onDatesChangeForDRP = this.onDatesChangeForDRP.bind(this);
    this.handleClosePopover = this.handleClosePopover.bind(this);
    this.getAvatar = this.getAvatar.bind(this);
    this.onClickBar = this.onClickBar.bind(this);
    this.getMultipleDayElement = this.getMultipleDayElement.bind(this);
    this.handleOnClickSingleDayTableRow = this.handleOnClickSingleDayTableRow.bind(
      this
    );
    this.getSingleDayElement = this.getSingleDayElement.bind(this);
    this.getWorkTime = this.getWorkTime.bind(this);
    this.gobackList = this.gobackList.bind(this);
    this.isLogined = this.isLogined.bind(this);
    this.getAvailableRecordBtns = this.getAvailableRecordBtns.bind(this);
    this.recordButtons = this.recordButtons.bind(this);
    this.handleRecordButtonClick = this.handleRecordButtonClick.bind(this);
    this.saveWorklog = this.saveWorklog.bind(this);
    this.deleteWorklog = this.deleteWorklog.bind(this);
    this.getModalBody = this.getModalBody.bind(this);
    this.addFuseLog = this.addFuseLog.bind(this);
    this.getFuseModalBody = this.getFuseModalBody.bind(this);
    this.getFuseToVacationModalBody = this.getFuseToVacationModalBody.bind(
      this
    );
    this.closeFuseToVacationModal = this.closeFuseToVacationModal.bind(this);
    this.addFuseTime = this.addFuseTime.bind(this);
    this.closeFuseModal = this.closeFuseModal.bind(this);
    this.store = new TimeRecordStore(props.records, props.holidays);
    this.loginUserStore = new LoginStore(null);
    this.overloadStore = new OverloadStore([], []);
  }

  public onDatesChangeForDRP({
    startDate,
    endDate
  }: {
    startDate: moment.Moment | null;
    endDate: moment.Moment | null;
  }) {
    const updateObj = {
      ...this.state
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
        moment(this.state.endDate).format('YYYY-MM-DD')
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
        </Row>
      );
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
        target.format('YYYY-MM-DD')
      );
    }
  }

  public getMultipleDayElement() {
    const {
      datasets,
      calWorkTimeStr,
      overTimeStr,
      totalWorkTimeStr,
      totalEmergencyTimeStr,
      totalRestTimeStr,
      totalLawRestTimeStr,
      totalRemoteTimeStr
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
                <div className="callout callout-info">
                  <div className="text-muted">{totalRemoteTimeStr}</div>
                  <div>재택근무시간</div>
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
    const holidayDuration = luxon.Duration.fromISO(
      `PT${this.store.Holidays.length * 8}H`
    );
    const {
      updateDatas,
      calWorkTimeStr,
      overTimeStr,
      totalWorkTimeStr,
      totalEmergencyTimeStr,
      totalRestTimeStr,
      totalLawRestTimeStr,
      totalRemoteTimeStr
    } = TimeRecord.convertWorkTime(
      this.store.Records,
      this.state.startDate,
      this.state.endDate,
      holidayDuration
    );
    const datasets: IChartBarStacked2Props = updateDatas.reduce(
      (acc, cur) => {
        const { name, data } = cur;
        acc.labels.push(name);
        acc.datasets[0].data.push(!!data.WORK ? data.WORK : 0);
        acc.datasets[1].data.push(!!data.REST ? data.REST : 0);
        acc.datasets[2].data.push(!!data.EMERGENCY ? data.EMERGENCY : 0);
        acc.datasets[3].data.push(!!data.REMOTE ? data.REMOTE : 0);
        acc.datasets[4].data.push(!!data.VACATION ? data.VACATION : 0);
        acc.datasets[5].data.push(!!data.FUSEOVERLOAD ? data.FUSEOVERLOAD : 0);
        return acc;
      },
      {
        labels: new Array<string>(),
        datasets: [
          {
            label: 'WORK',
            data: new Array<number>(),
            backgroundColor: bgColor[1].color
          },
          {
            label: 'REST',
            data: new Array<number>(),
            backgroundColor: bgColor[0].color
          },
          {
            label: 'EMERGENCY',
            data: new Array<number>(),
            backgroundColor: bgColor[2].color
          },
          {
            label: 'REMOTE',
            data: new Array<number>(),
            backgroundColor: bgColor[3].color
          },
          {
            label: 'VACATION',
            data: new Array<number>(),
            backgroundColor: bgColor[4].color
          },
          { label: 'FUSE', data: new Array<number>() }
        ]
      }
    );
    return {
      datasets,
      calWorkTimeStr,
      overTimeStr,
      totalWorkTimeStr,
      totalEmergencyTimeStr,
      totalRestTimeStr,
      totalLawRestTimeStr,
      totalRemoteTimeStr
    };
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
        moment(this.state.backupDate.end).format('YYYY-MM-DD')
      );
    }
  }

  public handleOnClickSingleDayTableRow(key: string, data: ITimeRecordLogData) {
    const userInfo = this.loginUserStore.UserInfo;
    const loginUserInfo = this.loginUserStore.LoginUserInfo;
    // 자신의 데이터 이거나 관리자 일때만 modal open한다.
    if (!!userInfo && !!loginUserInfo) {
      if (!!loginUserInfo.auth && data.type !== EN_WORK_TYPE.FUSEOVERLOAD) {
        // 관리자는 하고 싶은거 다해~ 대신 차감만 못건드려. 이건 민감하거든 :)
        this.setState({
          ...this.state,
          isModalOpen: true,
          isFuseModalOpen: false,
          isFuseToVacationModalOpen: false,
          fuseHours: luxon.Duration.fromObject({ hours: 0 }),
          updateData: { key, data }
        });
      } else if (
        this.props.userId === userInfo.id &&
        data.type !== EN_WORK_TYPE.FUSEOVERLOAD
      ) {
        // 자신의 데이터는 금주의 데이터 && 자신의 데이터 && 차감이 아닐 때
        this.setState({
          ...this.state,
          isModalOpen: true,
          isFuseModalOpen: false,
          isFuseToVacationModalOpen: false,
          fuseHours: luxon.Duration.fromObject({ hours: 0 }),
          updateData: { key, data }
        });
      }
    }
  }

  public getSingleDayElement() {
    const covertData = this.getWorkTime();
    const labels = covertData.datasets.datasets.map(mv => mv.label);
    const datasets = covertData.datasets.datasets.reduce(
      (acc: { data: number[]; backgroundColor: string[] }, cur) => {
        acc.data = [...acc.data, ...cur.data];
        return acc;
      },
      {
        data: [],
        backgroundColor: [
          bgColor[1].color,
          bgColor[0].color,
          bgColor[2].color,
          bgColor[3].color,
          bgColor[4].color
        ]
      }
    );
    const haveRecord = !!this.store.Records && this.store.Records.length > 0;
    let records: JSX.Element[] | null = null;
    if (haveRecord === true) {
      const firstData = this.store.Records[0];
      const firstKey = Object.keys(firstData)[0];
      const data = firstData[firstKey];
      records = Object.keys(data).map(mv => {
        const tData = data[mv];
        return (
          <tr
            key={mv}
            className="clickable"
            onClick={() => {
              this.handleOnClickSingleDayTableRow(mv, tData);
            }}
          >
            <td>{EN_WORK_TITLE_KR[tData.type]}</td>
            <td>{Util.toDateTimeShort(tData.time)}</td>
            <td>{!!tData.done ? Util.toDateTimeShort(tData.done) : 'none'}</td>
          </tr>
        );
      });
    }
    const goBackList =
      !!this.state.backupDate && !!this.state.backupDate.start ? (
        <Button onClick={this.gobackList}>리스트로 돌아가기</Button>
      ) : null;
    return (
      <>
        <Card>
          <CardBody>
            <Row>
              <Col>
                {goBackList}
                <div className="chart-wrapper">
                  <ChartPieDonut labels={labels} datasets={[datasets]} />
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
                  <tbody>{records}</tbody>
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
    return this.loginUserStore.isLogin;
  }

  public recordButtons() {
    // client 사이드에서만 작동하도록 함
    if (this.state.isServer === true) {
      return null;
    }
    // 하루를 선택했고,
    // 로고인 되어있으며,
    // 관리자 권한이 있을때!
    if (
      this.isOneDay === true &&
      !!Auth.loginUserTokenKey &&
      !!this.loginUserStore.LoginUserInfo &&
      !!this.loginUserStore.LoginUserInfo.auth
    ) {
      const allButtonOn = {
        WORK: true,
        BYEBYE: true,
        REMOTE: true,
        REMOTEDONE: true,
        REST: true,
        EMERGENCY: true,
        DONE: true,
        VACATION: true,
        HALFVACATION: true,
        FUSEOVERLOAD: true,
        FUSEOVERLOAD_VACATION: true
      };
      return (
        <RecordButtons
          menuOnOff={allButtonOn}
          handleClickMenu={this.handleRecordButtonClick}
        />
      );
    }
    // 로그인 했고!
    // 날짜 길이가 1일 정도를 선택했을 때!
    // 자신의 정보일 때!
    if (
      this.isLogined() === true &&
      !!this.loginUserStore.UserInfo &&
      this.isOneDay === true &&
      this.loginUserStore.UserInfo.id === this.props.userId
    ) {
      return (
        <RecordButtons
          menuOnOff={this.getAvailableRecordBtns()}
          handleClickMenu={this.handleRecordButtonClick}
        />
      );
    }
    return null;
  }

  get isCurrentWeek() {
    const now = moment().zone('Asia/Seoul');
    const startDate = moment(this.state.startDate);
    const endDate = moment(this.state.endDate);
    return now.week() === startDate.week() && now.week() === endDate.week();
  }

  get isOneDay() {
    const start = moment(this.state.startDate);
    const end = moment(this.state.endDate);
    return start.diff(end, 'days') === 0;
  }

  public getAvailableRecordBtns() {
    const returnValue = {
      WORK: false,
      BYEBYE: false,
      REMOTE: false,
      REMOTEDONE: false,
      REST: false,
      EMERGENCY: false,
      DONE: false,
      VACATION: true,
      HALFVACATION: true,
      FUSEOVERLOAD: true,
      FUSEOVERLOAD_VACATION: true
    };
    if (this.isOneDay === false) {
      return returnValue;
    }
    const firstData = this.store.Records[0];
    if (firstData === undefined) {
      returnValue.WORK = true;
      returnValue.REMOTE = true;
      returnValue.EMERGENCY = true;
      return returnValue;
    }
    const firstKey = Object.keys(firstData)[0];
    const data = firstData[firstKey];
    const logs = Object.keys(data).map(key => data[key]);
    // 아무런 데이터가 없는가?
    if (logs.length === 0) {
      // 출근, 재택근무, 긴급대응만 open
      returnValue.WORK = true;
      returnValue.REMOTE = true;
      returnValue.EMERGENCY = true;
      return returnValue;
    }
    returnValue.WORK = TimeRecord.possibleAddWorkOrRemote(logs);
    returnValue.BYEBYE = TimeRecord.possibleAddByeBye(logs);
    returnValue.REMOTE = TimeRecord.possibleAddWorkOrRemote(logs);
    returnValue.REMOTEDONE = TimeRecord.possibleAddRemoteDone(logs);
    returnValue.REST = TimeRecord.possibleAddRest(logs);
    returnValue.EMERGENCY = TimeRecord.possibleAddEmergency(logs);
    returnValue.DONE =
      logs.filter(
        fv =>
          (fv.type === EN_WORK_TYPE.REST ||
            fv.type === EN_WORK_TYPE.EMERGENCY) &&
          (fv.done === null || fv.done === undefined)
      ).length > 0;
    return returnValue;
  }

  /** [기록 버튼] 클릭 핸들러 */
  public async handleRecordButtonClick(type: EN_WORK_TYPE) {
    if (this.isOneDay === true && !!Auth.loginUserTokenKey) {
      // 차감 메뉴를 클릭했나?
      if (type === EN_WORK_TYPE.FUSEOVERLOAD) {
        // 차감용 모달을 연다.
        this.setState({
          ...this.state,
          isModalOpen: false,
          isFuseModalOpen: true,
          isFuseToVacationModalOpen: false,
          updateData: undefined,
          fuseHours: luxon.Duration.fromObject({ hours: 0 })
        });
        return;
      }
      if (type === EN_WORK_TYPE.FUSEOVERLOAD_VACATION) {
        // 차감해서 휴가쓰는 메뉴 연다.
        this.setState({
          ...this.state,
          isModalOpen: false,
          isFuseModalOpen: false,
          isFuseToVacationModalOpen: true,
          updateData: undefined,
          fuseHours: luxon.Duration.fromObject({ hours: 0 })
        });
        return;
      }
      // 차감 메뉴 외에는 아래에서 처리한다.
      await this.store.addTimeRecord(
        Auth.loginUserTokenKey,
        this.props.userId,
        type,
        luxon.DateTime.fromJSDate(this.state.startDate)
      );
      await this.store.findTimeRecord(
        this.props.userId,
        moment(this.state.startDate).format('YYYY-MM-DD'),
        moment(this.state.endDate).format('YYYY-MM-DD')
      );
    }
  }

  public async saveWorklog() {
    const updateData = this.state.updateData;
    if (!!updateData === false) {
      return this.setState({
        ...this.state,
        isModalOpen: false,
        updateData: undefined
      });
    }

    // REST, EMERGENCY는 완료 시간이 있으니 완료 시간 체크가 필요하다.
    const data = updateData!.data;
    const originalStart = luxon.DateTime.fromISO(data!.time);
    const startTimeStr = this.modalStartTimeRef.current!.value;
    const start = luxon.DateTime.fromFormat(
      originalStart.toFormat('yyyy-LL-dd').concat(` ${startTimeStr}`),
      'yyyy-LL-dd HH:mm'
    );
    if (
      data.type === EN_WORK_TYPE.REST ||
      data.type === EN_WORK_TYPE.EMERGENCY
    ) {
      // end time 계산 필요.
      const endDateStr = this.modalEndDateRef.current!.value;
      const endTimeStr = this.modalEndTimeRef.current!.value;
      const end = luxon.DateTime.fromFormat(
        `${endDateStr} ${endTimeStr}`,
        'yyyy-LL-dd HH:mm'
      );
      // 시작 시간보다 뒤인가?
      if (end.diff(start).milliseconds < 0) {
        return alert('종료 시간은 시작 시간을 앞 설 수 없어요.');
      }
    }

    // 실제 업데이트를 진행하자!
    // time 부분 수정
    if (
      originalStart.toFormat('yyyy-LL-dd HH:mm') !==
      start.toFormat('yyyy-LL-dd HH:mm')
    ) {
      await this.store.updateTimeRecord(
        Auth.loginUserTokenKey!,
        this.props.userId,
        start.toFormat('yyyyLLdd'),
        updateData!.key,
        'time',
        start.toUTC().toISO()
      );
    }
    // done 업데이트 여부 결정
    if (
      data.type === EN_WORK_TYPE.REST ||
      data.type === EN_WORK_TYPE.EMERGENCY
    ) {
      const haveDone = !!data.done;
      const endDateStr = this.modalEndDateRef.current!.value;
      const endTimeStr = this.modalEndTimeRef.current!.value;
      const end = luxon.DateTime.fromFormat(
        `${endDateStr} ${endTimeStr}`,
        'yyyy-LL-dd HH:mm'
      );
      let updateDone = false;
      // 기존 완료 시간이 있는가?
      if (haveDone === true) {
        const originalEnd = luxon.DateTime.fromISO(data!.done!);
        if (
          originalEnd.toFormat('yyyy-LL-dd HH:mm') !==
          end.toFormat('yyyy-LL-dd HH:mm')
        ) {
          updateDone = true;
        }
      } else if (
        start.toFormat('yyyy-LL-dd HH:mm') !== end.toFormat('yyyy-LL-dd HH:mm')
      ) {
        // 시작 시간과 다른가?
        updateDone = true;
      }
      if (updateDone === true) {
        await this.store.updateTimeRecord(
          Auth.loginUserTokenKey!,
          this.loginUserStore.UserInfo!.id,
          start.toFormat('yyyyLLdd'),
          updateData!.key,
          'done',
          end.toUTC().toISO()
        );
      }
    }
    this.setState({ ...this.state, isModalOpen: false, updateData: undefined });
    await this.store.findTimeRecord(
      this.props.userId,
      moment(this.state.startDate).format('YYYY-MM-DD'),
      moment(this.state.endDate).format('YYYY-MM-DD')
    );
  }

  public async deleteWorklog() {
    const deleteData = this.state.updateData;
    if (Util.isEmpty(deleteData)) {
      return this.setState({
        ...this.state,
        isModalOpen: false,
        updateData: undefined
      });
    }

    // 삭제 진행!
    const data = deleteData.data;
    // done 업데이트 여부 결정
    if (data.type !== EN_WORK_TYPE.FUSEOVERLOAD) {
      await this.store.deleteTimeRecord(
        Auth.loginUserTokenKey!,
        this.loginUserStore.UserInfo!.id,
        luxon.DateTime.fromJSDate(this.state.startDate),
        deleteData.key
      );
    }
    this.setState({ ...this.state, isModalOpen: false, updateData: undefined });
    await this.store.findTimeRecord(
      this.props.userId,
      moment(this.state.startDate).format('YYYY-MM-DD'),
      moment(this.state.endDate).format('YYYY-MM-DD')
    );
  }

  public getModalBody() {
    const updateData = this.state.updateData;
    if (!!updateData === false) {
      return null;
    }
    const data = updateData!.data;
    const start = luxon.DateTime.fromISO(data.time);
    const startDate = start.toFormat('yyyy-LL-dd');
    const startTime = start.toFormat('HH:mm');

    let doneElement: JSX.Element | null = null;
    if (
      data.type === EN_WORK_TYPE.REST ||
      data.type === EN_WORK_TYPE.EMERGENCY
    ) {
      if (!!data.done) {
        const end = luxon.DateTime.fromISO(data.done);
        const endDate = end.toFormat('yyyy-LL-dd');
        const endTime = end.toFormat('HH:mm');
        doneElement = (
          <FormGroup>
            <Label>완료</Label>
            <Input
              type="date"
              id="date-input"
              name="date-input"
              placeholder="date"
              defaultValue={endDate}
              disabled={data.type === EN_WORK_TYPE.REST}
              innerRef={this.modalEndDateRef}
            />
            <Input
              type="time"
              id="time-input"
              name="time-input"
              placeholder="time"
              defaultValue={endTime}
              innerRef={this.modalEndTimeRef}
            />
          </FormGroup>
        );
      } else {
        doneElement = (
          <FormGroup>
            <Label>완료</Label>
            <Input
              type="date"
              id="date-input"
              name="date-input"
              placeholder="date"
              defaultValue={startDate}
              disabled={data.type === EN_WORK_TYPE.REST}
              innerRef={this.modalEndDateRef}
            />
            <Input
              type="time"
              id="time-input"
              name="time-input"
              placeholder="time"
              defaultValue={startTime}
              innerRef={this.modalEndTimeRef}
            />
          </FormGroup>
        );
      }
    }

    return (
      <>
        <ModalHeader>
          {`${updateData!.key} ${EN_WORK_TITLE_KR[updateData!.data.type]} 수정`}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>시작</Label>
            <Input
              type="date"
              id="date-input"
              name="date-input"
              placeholder="date"
              defaultValue={startDate}
              disabled={true}
            />
            <Input
              type="time"
              id="time-input"
              name="time-input"
              placeholder="time"
              defaultValue={startTime}
              innerRef={this.modalStartTimeRef}
            />
          </FormGroup>
          {doneElement}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={this.deleteWorklog}>
            삭제
          </Button>
          <Button color="success" onClick={this.saveWorklog}>
            저장
          </Button>
          <Button
            className="btn btn-primary"
            onClick={() => {
              this.setState({
                ...this.state,
                isModalOpen: false,
                updateData: undefined
              });
            }}
          >
            닫기
          </Button>
        </ModalFooter>
      </>
    );
  }

  public async addFuseLog(isVacation: boolean = false, note?: string) {
    if (this.state.isServer === true || Auth.loginUserTokenKey === null) {
      return;
    }
    const haveRecord = !!this.store.Records && this.store.Records.length > 0;
    if (!isVacation && haveRecord) {
      const firstData = this.store.Records[0];
      const firstKey = Object.keys(firstData)[0];
      const data = firstData[firstKey];
      const usedFuseDuration = Object.keys(data)
        .map(mv => data[mv])
        .filter(fv => fv.type === EN_WORK_TYPE.FUSEOVERLOAD)
        .reduce((acc, cur) => {
          const start = luxon.DateTime.fromISO(cur.time);
          const end = luxon.DateTime.fromISO(cur.done!);
          const diffMs = end.diff(start).as('milliseconds');
          const duration = luxon.Duration.fromObject({ milliseconds: diffMs });
          return acc.plus(duration);
        }, luxon.Duration.fromISO('PT0S'));
      const totalFuseDuration = usedFuseDuration.plus(this.state.fuseHours);
      if (totalFuseDuration > luxon.Duration.fromISO('PT6H')) {
        alert('하루 최대 6시간만 차감 가능합니다.');
        return;
      }
    }
    const fuseDuration = isVacation
      ? luxon.Duration.fromISO('PT8H')
      : this.state.fuseHours;
    const targetDate = luxon.DateTime.fromJSDate(this.state.startDate);
    const userId = this.props.userId;
    await this.overloadStore.addFuseOverload(
      Auth.loginUserTokenKey,
      userId,
      targetDate,
      fuseDuration,
      isVacation,
      note
    );
    this.setState({
      ...this.state,
      isFuseModalOpen: false,
      isFuseToVacationModalOpen: false,
      fuseHours: luxon.Duration.fromObject({ hours: 0 })
    });
    await this.store.findTimeRecord(
      this.props.userId,
      moment(this.state.startDate).format('YYYY-MM-DD'),
      moment(this.state.endDate).format('YYYY-MM-DD')
    );
    await this.overloadStore.findAllFuseOverload(userId);
  }

  public getFuseModalBody() {
    const totalRemain = this.overloadStore.totalRemain();
    const haveFuseData = !!this.overloadStore.Records && !!totalRemain;
    const duration = this.state.fuseHours;
    let message = <Label>추가 근무 기록이 없습니다.</Label>;
    if (haveFuseData === true) {
      const totalRemainTime = this.overloadStore.totalRemainTime();
      message = (
        <>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              사용가능한 시간 {totalRemainTime}
            </li>
            <li className="list-group-item">
              <Button
                onClick={() => {
                  this.addFuseTime(luxon.Duration.fromObject({ minutes: 30 }));
                }}
              >
                +00:30 추가
              </Button>
              <Button
                onClick={() => {
                  this.addFuseTime(luxon.Duration.fromObject({ hours: 1 }));
                }}
              >
                +01:00 추가
              </Button>
              <Button
                className="btn-danger"
                onClick={() =>
                  this.setState({
                    ...this.state,
                    fuseHours: luxon.Duration.fromObject({ hours: 0 })
                  })
                }
              >
                초기화
              </Button>
            </li>
          </ul>
          <div className="h4 mb-0">{duration.toFormat('hh:mm:ss')}</div>
        </>
      );
    }
    return (
      <>
        <ModalHeader>추가 근무 차감</ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          {haveFuseData === false ? null : (
            <Button
              onClick={() => {
                this.addFuseLog();
              }}
              color="success"
            >
              저장
            </Button>
          )}
          <Button
            onClick={() => {
              this.closeFuseModal();
            }}
          >
            닫기
          </Button>
        </ModalFooter>
      </>
    );
  }

  private closeFuseModal() {
    this.setState({
      ...this.state,
      isFuseModalOpen: false,
      fuseHours: luxon.Duration.fromObject({ hours: 0 })
    });
  }

  private addFuseTime(addTime: luxon.Duration) {
    const totalRemain = this.overloadStore.totalRemain();
    if (totalRemain === null) {
      return;
    }
    const update = this.state.fuseHours.plus(addTime);
    // 총 시간보다 더 큰지 확인해야한다.
    const duration = update.normalize();
    const addMaxDuration = luxon.Duration.fromISO('PT6H');
    const totalRemainDuration = luxon.Duration.fromObject(
      totalRemain
    ).normalize();
    if (duration > totalRemainDuration) {
      alert('차감 가능한 시간을 초과한 입력입니다.');
      return;
    }
    if (duration > addMaxDuration) {
      alert('최대 차감 가능 시간인 6시간을 초과한 입력입니다.');
      return;
    }
    this.setState({ ...this.state, fuseHours: update });
  }

  public getFuseToVacationModalBody() {
    const totalRemain = this.overloadStore.totalRemain();
    const haveFuseData =
      !!this.overloadStore.Records &&
      !!totalRemain &&
      luxon.Duration.fromObject(totalRemain) > luxon.Duration.fromISO('PT10H');
    const totalRemainTime = this.overloadStore.totalRemainTime();
    let message = (
      <Label>{`추가 근무 기록이 없거나 10시간보다 부족합니다. ${totalRemainTime}`}</Label>
    );
    if (haveFuseData === true) {
      message = (
        <>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              사용가능한 시간 {totalRemainTime}
            </li>
            <li className="list-group-item">
              10시간의 초과근무시간을 사용해서 휴가를 사용하시겠습니까?
              <br />이 기록은 추가 후 변경이 불가능합니다.
            </li>
            <li className="list-group-item">
              <Input
                type="text"
                id="note-input"
                name="note-input"
                placeholder="사유를 간단히 작성해주세요"
                innerRef={this.modalNoteRef}
              />
            </li>
          </ul>
        </>
      );
    }
    return (
      <>
        <ModalHeader>추가 근무(10시간)으로 휴가 사용하기</ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          {haveFuseData === false ? null : (
            <Button
              onClick={() => {
                this.addFuseLog(true, this.modalNoteRef.current!.value);
              }}
              color="success"
            >
              사용하기
            </Button>
          )}
          <Button
            onClick={() => {
              this.closeFuseToVacationModal();
            }}
          >
            닫기
          </Button>
        </ModalFooter>
      </>
    );
  }

  private closeFuseToVacationModal() {
    this.setState({
      ...this.state,
      isFuseToVacationModalOpen: false,
      fuseHours: luxon.Duration.fromObject({ hours: 0 })
    });
  }

  public async componentDidMount() {
    this.setState({
      ...this.state,
      isServer: false
    });
    if (
      Auth.isLogined === true &&
      !!Auth.loginUserKey &&
      !!Auth.loginUserTokenKey
    ) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
      await this.loginUserStore.findLoginUserInfo(Auth.loginUserTokenKey);
      await this.overloadStore.findAllOverload(this.props.userId);
      await this.overloadStore.findAllFuseOverload(this.props.userId);
    }
  }

  public render() {
    const diffDay = Math.abs(
      moment(this.state.startDate).diff(moment(this.state.endDate), 'days')
    );
    const renderElement =
      diffDay > 0 ? this.getMultipleDayElement() : this.getSingleDayElement();
    const avatar = this.getAvatar();
    const recordButtons = this.recordButtons();
    const modalBody = this.getModalBody();
    const fuseModalBody = this.getFuseModalBody();
    const fuseToVacationModalBody = this.getFuseToVacationModalBody();
    return (
      <div className="app">
        <Helmet>
          <title>User {this.props.userId} Work Log</title>
        </Helmet>
        <DefaultHeader
          isLogin={this.isLogined()}
          userInfo={this.loginUserStore.UserInfo}
          onClickLogin={() => {
            window.location.href = '/login';
          }}
          onClickLogout={() => {
            this.loginUserStore.logout(this.state.isServer);
          }}
        />
        <div className="app-body">
          <Container>
            <Card>
              <CardBody>{avatar}</CardBody>
            </Card>
            <Card>
              <CardBody>
                <DateRangePicker
                  startDate={moment(this.state.startDate)}
                  endDate={moment(this.state.endDate)}
                  startDateId="startDate"
                  endDateId="endDate"
                  orientation="vertical"
                  focusedInput={this.state.focusedInput}
                  onDatesChange={this.onDatesChangeForDRP}
                  onFocusChange={focusedInput =>
                    this.setState({ ...this.state, focusedInput })
                  }
                  minimumNights={0}
                  isOutsideRange={day => false}
                  onClose={this.handleClosePopover}
                  noBorder={true}
                  block={true}
                />
              </CardBody>
            </Card>
            {renderElement}
            <div className={`${floatButton}`}>{recordButtons}</div>
          </Container>
          <Modal isOpen={this.state.isModalOpen}>{modalBody}</Modal>
          <Modal isOpen={this.state.isFuseModalOpen}>{fuseModalBody}</Modal>
          <Modal isOpen={this.state.isFuseToVacationModalOpen}>
            {fuseToVacationModalBody}
          </Modal>
        </div>
      </div>
    );
  }
}

export default RecordContainer;
