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
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Container,
  FormGroup,
  FormText,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table
} from 'reactstrap';

import { IHoliday } from '../../models/time_record/interface/IHoliday';
import {
  IFuseOverWork,
  IOverWork
} from '../../models/time_record/interface/IOverWork';
import { ITimeRecordLogData } from '../../models/time_record/interface/ITimeRecordLogData';
import { GetHolidaysJSONSchema } from '../../models/time_record/JSONSchema/GetHolidaysJSONSchema';
import { GetOverloadsByUserIDJSONSchema } from '../../models/time_record/JSONSchema/GetOverloadsJSONSchema';
import { GetTimeRecordsJSONSchema } from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { Overload } from '../../models/time_record/Overload';
import { OverloadRequestBuilder } from '../../models/time_record/OverloadRequestBuilder';
import { TimeRecord } from '../../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../../models/time_record/TimeRecordRequestBuilder';
import { IUserInfo } from '../../models/user/interface/IUserInfo';
import { GetGroupUserInfosJSONSchema } from '../../models/user/JSONSchema/GetGroupUserInfosJSONSchema';
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
  records: {
    [key: string]: Array<{
      [key: string]: { [key: string]: ITimeRecordLogData };
    }>;
  };
  overloads: { [key: string]: IOverWork[] };
  fuseOverloads: { [key: string]: IFuseOverWork[] };
  initialStartDate: string;
  initialEndDate: string;
  holidays: IHoliday[];
}

type TStates = IRecordContainerStates & { isModalOpen: boolean };

const log = debug('trv:GroupContainer');

@observer
export default class GroupContainer extends React.Component<
  IGroupContainerProps,
  TStates
> {
  private store: GroupStore;
  private loginUserStore: LoginStore;

  private modalEmailRef = React.createRef<HTMLInputElement>();

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
        groupId: match.params.group_id
      }
    };

    const rb = new UserRequestBuilder(rbParam);
    const action = new User(rb);

    const actionResp = await action.findGroups(
      checkParams,
      GetGroupUserInfosJSONSchema
    );

    const records = {};
    const overloads = {};
    const fuseOverloads = {};
    let holidays: IHoliday[] = [];
    log('actionResp.type: ', actionResp.type);
    if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
      log('actionResp.type: ', actionResp.type);
      const trRb = new TimeRecordRequestBuilder(rbParam);
      const trAction = new TimeRecord(trRb);
      const holidaysResp = await trAction.getHolidays(
        {
          query: {
            start_date: startDate,
            end_date: endDate
          }
        },
        GetHolidaysJSONSchema
      );
      if (holidaysResp.type === EN_REQUEST_RESULT.SUCCESS) {
        holidays = holidaysResp.data;
      }
      const olRb = new OverloadRequestBuilder(rbParam);
      const olAction = new Overload(olRb);
      // 각 사용자의 일한 시간도 뽑아내자.
      const promises = actionResp.data.map(async (mv, i) => {
        const resp = await trAction.findAll(
          { query: { userId: mv.id, startDate, endDate } },
          GetTimeRecordsJSONSchema
        );
        log(resp.data);
        records[mv.id] =
          !!resp && resp.type === EN_REQUEST_RESULT.SUCCESS ? resp.data : [];
        const olQuery = { query: { user_id: mv.id } };
        const olResp = await olAction.findAllByUserID(
          olQuery,
          GetOverloadsByUserIDJSONSchema
        );
        overloads[mv.id] =
          !!olResp && olResp.type === EN_REQUEST_RESULT.SUCCESS
            ? olResp.data
            : [];
        const olFuseResp = await olAction.findAllFuseUserID(
          olQuery,
          GetOverloadsByUserIDJSONSchema
        );
        fuseOverloads[mv.id] =
          !!olFuseResp && olFuseResp.type === EN_REQUEST_RESULT.SUCCESS
            ? olFuseResp.data
            : [];
      });
      while (promises.length > 0) {
        await promises.pop();
      }
    }

    return {
      groupId: match.params.group_id,
      group:
        actionResp.type === EN_REQUEST_RESULT.SUCCESS
          ? actionResp.data.sort((a, b) => (a.real_name > b.real_name ? 1 : -1))
          : [],
      records,
      overloads,
      fuseOverloads,
      initialStartDate: startDate,
      initialEndDate: endDate,
      holidays
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
      isModalOpen: false
    };

    this.onDatesChangeForDRP = this.onDatesChangeForDRP.bind(this);
    this.handleClosePopover = this.handleClosePopover.bind(this);
    this.handleClickRow = this.handleClickRow.bind(this);
    this.getTimeObjectToString = this.getTimeObjectToString.bind(this);
    this.getRows = this.getRows.bind(this);
    this.isManager = this.isManager.bind(this);
    this.getWeek = this.getWeek.bind(this);
    this.calGroupWorkTime = this.calGroupWorkTime.bind(this);
    this.getDataElements = this.getDataElements.bind(this);
    this.isLogined = this.isLogined.bind(this);
    this.modalBody = this.modalBody.bind(this);
    this.store = new GroupStore(
      props.records,
      props.group,
      props.overloads,
      props.fuseOverloads,
      props.holidays
    );
    this.loginUserStore = new LoginStore(null);
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
      await this.store.findGroupRecords(
        moment(this.state.startDate).format('YYYY-MM-DD'),
        moment(this.state.endDate).format('YYYY-MM-DD')
      );
    }
  }

  public handleClickRow(userId: string) {
    const haveData =
      !!this.store.Records[userId] && this.store.Records[userId].length > 0;
    if (haveData === true) {
      const startDate = luxon.DateTime.fromJSDate(
        this.state.startDate
      ).toFormat('yyyy-LL-dd');
      const endDate = luxon.DateTime.fromJSDate(this.state.endDate).toFormat(
        'yyyy-LL-dd'
      );
      window.location.href = `/records/${userId}?startDate=${startDate}&endDate=${endDate}`;
    }
  }

  public getTimeObjectToString(totalRemainDurationObj: luxon.DurationObject) {
    let duration = luxon.Duration.fromObject(totalRemainDurationObj);
    const milliseconds = duration.as('milliseconds');
    if (milliseconds < 0) {
      duration = luxon.Duration.fromMillis(Math.abs(milliseconds));
    }
    return milliseconds < 0
      ? `-${duration.toFormat('hh:mm:ss')}`
      : duration.toFormat('hh:mm:ss');
  }

  public isManager(): { result: boolean; id?: string } {
    // 그룹 내의 매니저 권한을 가지고 있는지 확인한다.
    if (this.isLogined() === false) {
      return { result: false };
    }
    const loginUserInfo = this.loginUserStore.UserInfo;
    if (loginUserInfo === null) {
      return { result: false };
    }
    const { id } = loginUserInfo;
    return { id, result: true };
  }

  /** start, end를 통해서 이번주가 1주일 안의 기록을 조회한 것이라면 week string을 획득한다 */
  public getWeek() {
    const { startDate, endDate } = this.state;
    const lSd = luxon.DateTime.fromJSDate(startDate);
    const lEd = luxon.DateTime.fromJSDate(endDate);
    const duration = lEd.diff(lSd);
    const today = luxon.DateTime.local();
    if (lSd <= today && lEd >= today) {
      return null;
    }
    if (
      duration.milliseconds === 518400000 &&
      lSd.weekday === 7 &&
      lEd.weekday === 6
    ) {
      return `${lEd.weekYear}-W${lEd.weekNumber}`;
    }
    return null;
  }

  public getRows() {
    // 뷰하는 기록이 일요일-토요일로 7일간의 기록을 특정하고 있는지 확인한다.
    const isManager = this.isManager();
    const weekStr = this.getWeek();
    const isOneWeek = weekStr !== null;
    const holidaysDuration = luxon.Duration.fromISO(
      `PT${this.store.Holidays.length * 8}H`
    );
    return this.props.group.map(mv => {
      const convertData =
        !!this.store.Records[mv.id] && this.store.Records[mv.id].length > 0
          ? TimeRecord.convertWorkTime(
              this.store.Records[mv.id],
              this.state.startDate,
              this.state.endDate,
              holidaysDuration
            )
          : {
              updateDatas: null,
              overTimeObj: null,
              calWorkTimeStr: 'none',
              overTimeStr: 'none'
            };
      const lastActive =
        !!convertData.updateDatas && convertData.calWorkTimeStr !== 'none'
          ? convertData.updateDatas[convertData.updateDatas.length - 1].name
          : 'none';
      const badgeStatus =
        lastActive !== 'none' && !!convertData.overTimeObj
          ? luxon.Duration.fromObject(convertData.overTimeObj).as('hours') >= 1
            ? 'danger'
            : 'success'
          : null;
      const totalRemain = Util.totalRemain(
        this.store.OverWorks[mv.id],
        this.store.FuseOverWorks[mv.id]
      );
      const totalRemainStr =
        totalRemain === null ? '-' : this.getTimeObjectToString(totalRemain);
      const totalRemainBtn =
        totalRemain === null ? (
          '-'
        ) : (
          <Button
            onClick={e => {
              e.stopPropagation();
              window.location.href = `/overload/${mv.id}`;
            }}
          >
            {totalRemainStr}
          </Button>
        );
      const settlementBtn = ((user: IUserInfo) => {
        if (!isManager.result || !isOneWeek) {
          return null;
        }
        const settlementRecord = this.store.getMemberOverWork({
          user_id: user.id,
          week: weekStr!
        });
        if (settlementRecord === null) {
          return (
            <td>
              <Button
                onClick={async e => {
                  e.stopPropagation();
                  await this.store.addOverWork({
                    user_id: mv.id,
                    week: weekStr!,
                    manager_id: isManager.id!
                  });
                  await this.store.loadOverWorks({ user_id: mv.id });
                }}
              >
                정산
              </Button>
            </td>
          );
        }
        return <td />;
      })(mv);
      return (
        <tr
          key={mv.id}
          onClick={() => {
            this.handleClickRow(mv.id);
          }}
          style={{ cursor: 'pointer' }}
        >
          <td className="text-center">
            <GroupUserAvatar
              key={mv.id}
              img_url={mv.profile_url}
              alt={mv.real_name}
              badge_status={badgeStatus}
            />
          </td>
          <td className="d-none d-sm-table-cell">
            <div>{mv.real_name}</div>
            <div className="small text-muted">slack id: {mv.name}</div>
          </td>
          <td>{convertData.calWorkTimeStr}</td>
          <td className="d-none d-sm-table-cell">{convertData.overTimeStr}</td>
          <td>{totalRemainBtn}</td>
          {settlementBtn}
          {isManager.result ? (
            <td>
              <Button
                color="danger"
                onClick={async e => {
                  e.stopPropagation();
                  const result = await this.store.deleteMember({
                    group_id: this.props.groupId,
                    user_id: mv.id,
                    manager_id: isManager.id!
                  });
                  if (result === false) {
                    alert('멤버 삭제 실패');
                  } else {
                    alert('멤버 삭제 완료. 페이지를 리로드합니다.');
                    window.location.reload();
                  }
                }}
              >
                X
              </Button>
            </td>
          ) : null}
          <td>
            <Button
              onClick={e => {
                e.stopPropagation();
                window.location.href = `/convert_vacation/${mv.id}`;
              }}
            >
              휴가금고 조회
            </Button>
          </td>
        </tr>
      );
    });
  }

  public calGroupWorkTime() {
    function getMedian(numbers: number[]) {
      const numsLen = numbers.length;
      const sortNumbers = [...numbers].sort((a, b) => a - b);

      if (numsLen % 2 === 0) {
        return (sortNumbers[numsLen / 2 - 1] + sortNumbers[numsLen / 2]) / 2;
      }
      return sortNumbers[(numsLen - 1) / 2];
    }
    const holidaysDuration = luxon.Duration.fromISO(
      `PT${this.store.Holidays.length * 8}H`
    );
    const workTimeValues = {
      totalWorkTime: luxon.Duration.fromObject({}),
      totalOverWorkTime: luxon.Duration.fromObject({}),
      averageOverWorkTime: luxon.Duration.fromObject({}),
      medianOverWorkTime: luxon.Duration.fromObject({})
    };
    // record 데이터가 비어있다면 기본 값을 바로 리턴한다.
    if (Util.isEmpty(this.store.Records)) {
      return workTimeValues;
    }
    const filterOutEmptyWorklog = Object.values(this.store.Records).filter(fv =>
      Util.isNotEmpty(fv)
    );
    const workTimeObjs = filterOutEmptyWorklog.map(mv =>
      TimeRecord.convertWorkTime(
        mv,
        this.state.startDate,
        this.state.endDate,
        holidaysDuration
      )
    );
    const reduceTimes = workTimeObjs.reduce(
      (acc, cur) => {
        const updateAcc = { ...acc };
        updateAcc.totalWorkTime += luxon.Duration.fromObject(
          cur.calWorkTimeObj
        ).as('milliseconds');
        const overtime = luxon.Duration.fromObject(cur.overTimeObj).as(
          'milliseconds'
        );
        updateAcc.totalOverWorkTime += overtime;
        return updateAcc;
      },
      { totalWorkTime: 0, totalOverWorkTime: 0 }
    );
    workTimeValues.totalWorkTime = luxon.Duration.fromMillis(
      reduceTimes.totalWorkTime
    );
    workTimeValues.totalOverWorkTime = luxon.Duration.fromMillis(
      reduceTimes.totalOverWorkTime
    );
    workTimeValues.averageOverWorkTime = luxon.Duration.fromMillis(
      reduceTimes.totalOverWorkTime / workTimeObjs.length
    );
    workTimeValues.medianOverWorkTime = luxon.Duration.fromMillis(
      getMedian(
        workTimeObjs.map(mv =>
          luxon.Duration.fromObject(mv.overTimeObj).as('milliseconds')
        )
      )
    );
    return workTimeValues;
  }

  public getDataElements() {
    const workTimeValues = this.calGroupWorkTime();
    return (
      <Row>
        <Col md={true} className="mb-sm-2 mb-0">
          <div className="callout callout-primary">
            <div className="text-muted">
              {workTimeValues.totalWorkTime.toFormat('hh:mm:ss')}
            </div>
            <div>총 근무 시간</div>
          </div>
        </Col>
        <Col md={true} className="mb-sm-2 mb-0">
          <div className="callout callout-danger">
            <div className="text-muted">
              {workTimeValues.totalOverWorkTime.toFormat('hh:mm:ss')}
            </div>
            <div>총 초과근무</div>
          </div>
        </Col>
        <Col md={true} className="mb-sm-2 mb-0">
          <div className="callout callout-primary">
            <div className="text-muted">
              {workTimeValues.averageOverWorkTime.toFormat('hh:mm:ss')}
            </div>
            <div>평균 초과근무</div>
          </div>
        </Col>
        <Col md={true} className="mb-sm-2 mb-0">
          <div className="callout callout-warning">
            <div className="text-muted">
              {workTimeValues.medianOverWorkTime.toFormat('hh:mm:ss')}
            </div>
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
      isServer: false
    });
    console.log(Auth.isLogined);
    console.log(!!Auth.loginUserKey);
    if (Auth.isLogined === true && !!Auth.loginUserKey) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
    }
  }

  public modalBody() {
    const isManager = this.isManager();
    return (
      <>
        <ModalHeader>{`${this.props.groupId} 멤버 추가`}</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label htmlFor="user_id_input">멤버 id</Label>
            <InputGroup>
              <Input
                type="email"
                id="user_id_input"
                name="user_id_input"
                placeholder="slack 멤버 id 입력"
                innerRef={this.modalEmailRef}
              />
              <InputGroupAddon addonType="append">
                <Button
                  onClick={async () => {
                    const result = await this.store.addMember({
                      group_id: this.props.groupId,
                      manager_id: isManager.id!,
                      user_id: this.modalEmailRef.current!.value
                    });
                    if (result === false) {
                      alert(
                        `${
                          this.modalEmailRef.current!.value
                        } 을/를 찾을 수 없습니다.`
                      );
                    } else {
                      alert('등록완료. 페이지를 리로드합니다.');
                      window.location.reload();
                    }
                  }}
                >
                  Add
                </Button>
              </InputGroupAddon>
            </InputGroup>
            <FormText>slack 워크스페이스에서 사용자 id를 확인하세요.</FormText>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            className="btn btn-primary"
            onClick={() => {
              this.setState({
                ...this.state,
                isModalOpen: false
              });
            }}
          >
            닫기
          </Button>
        </ModalFooter>
      </>
    );
  }

  public render() {
    const rows = this.getRows();
    const dataElements = this.getDataElements();
    const isManager = this.isManager();
    const weekStr = this.getWeek();
    const isOneWeek = weekStr !== null;
    const modalBody = this.modalBody();
    return (
      <div className="app">
        <Helmet>
          <title>Group {this.props.groupId} Work Log</title>
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
              <CardBody>
                <Button
                  onClick={() => {
                    const startDate = luxon.DateTime.fromJSDate(
                      this.state.startDate
                    );
                    const newStartDate = startDate.minus({ weeks: 1 });
                    this.setState({
                      ...this.state,
                      startDate: newStartDate.toJSDate(),
                      endDate: newStartDate.plus({ days: 6 }).toJSDate()
                    });
                    this.handleClosePopover();
                  }}
                >
                  -1 W
                </Button>
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
                  block={false}
                />
                <Button
                  onClick={() => {
                    const startDate = luxon.DateTime.fromJSDate(
                      this.state.startDate
                    );
                    const newStartDate = startDate.plus({ weeks: 1 });
                    this.setState({
                      ...this.state,
                      startDate: newStartDate.toJSDate(),
                      endDate: newStartDate.plus({ days: 6 }).toJSDate()
                    });
                    this.handleClosePopover();
                  }}
                >
                  +1 W
                </Button>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <h2>{this.props.groupId}</h2>
                {isManager.result && isOneWeek ? (
                  <Button
                    onClick={async e => {
                      e.stopPropagation();
                      await this.store.addOverWorkByGroup({
                        group_id: this.props.groupId,
                        week: weekStr!,
                        manager_id: isManager.id!
                      });
                      window.location.reload();
                    }}
                  >
                    {`그룹 전 인원(${weekStr}) 정산`}
                  </Button>
                ) : null}
                {isManager.result ? (
                  <Button
                    onClick={async e => {
                      e.stopPropagation();
                      this.setState({
                        ...this.setState,
                        isModalOpen: true
                      });
                    }}
                  >
                    멤버 추가
                  </Button>
                ) : null}
              </CardHeader>
              <CardBody>
                <Table responsive={true} className="d-sm-table" hover={false}>
                  <thead className="thead-light">
                    <tr>
                      <th className="text-center">
                        <i className="cui-people icons font-2xl" />
                      </th>
                      <th className="d-none d-sm-table-cell">사용자</th>
                      <th>근무시간</th>
                      <th className="d-none d-sm-table-cell">
                        기간 내 초과시간
                      </th>
                      <th>누적 초과시간</th>
                      {isManager.result && isOneWeek ? <th>정산</th> : null}
                      {isManager.result ? <th>X</th> : null}
                      <th>휴가금고</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
              </CardBody>
              <CardFooter>{dataElements}</CardFooter>
            </Card>
          </Container>
          <Modal isOpen={this.state.isModalOpen}>{modalBody}</Modal>
        </div>
      </div>
    );
  }
}
