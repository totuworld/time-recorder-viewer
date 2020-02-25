import '../../../styles/style.css';

import debug from 'debug';
import { Field, Form, Formik, FormikActions, FormikProps } from 'formik';
import * as luxon from 'luxon';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  FormFeedback,
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
  IFuseOverWork,
  IOverWork
} from '../../../models/time_record/interface/IOverWork';
import { GetOverloadsByUserIDJSONSchema } from '../../../models/time_record/JSONSchema/GetOverloadsJSONSchema';
import { Overload } from '../../../models/time_record/Overload';
import { OverloadRequestBuilder } from '../../../models/time_record/OverloadRequestBuilder';
import { IUserInfo } from '../../../models/user/interface/IUserInfo';
import { GetUserInfoJSONSchema } from '../../../models/user/JSONSchema/GetUserInfoJSONSchema';
import { User } from '../../../models/user/User';
import { UserRequestBuilder } from '../../../models/user/UserRequestBuilder';
import { Auth } from '../../../services/auth';
import { RequestBuilderParams } from '../../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../../services/util';
import LoginStore from '../../../stores/LoginStore';
import OverloadStore from '../../../stores/OverloadStore';
import DefaultHeader from '../../common/DefaultHeader';
import GroupUserAvatar from '../../group/user/avatar';
import { IAfterRequestContext } from '../../interface/IAfterRequestContext';

const log = debug('trv:recordOverloadContainer');

interface IRecordOverloadContainerProps {
  isOtherUser: boolean;
  userId: string | null;
  userInfo: IUserInfo | null;
  records: IOverWork[];
  fuseRecords: IFuseOverWork[];
}

interface IRecordOverloadContainerStates {
  isServer: boolean;
  modalIsOpen: boolean;
}

interface FormValues {
  week: string;
}

@observer
class RecordOverloadContainer extends React.Component<
  IRecordOverloadContainerProps,
  IRecordOverloadContainerStates
> {
  private overloadStore: OverloadStore;
  private loginUserStore: LoginStore;

  public static async getInitialProps({
    req,
    res,
    match
  }: IAfterRequestContext<{ user_id: string }>): Promise<
    IRecordOverloadContainerProps
  > {
    const user_id = match.params.user_id;
    if (!!user_id === false || user_id.length <= 0) {
      return {
        isOtherUser: false,
        userId: null,
        userInfo: null,
        records: [],
        fuseRecords: []
      };
    }

    let rbParam: RequestBuilderParams = { isProxy: true };
    if (!!req && !!req.config) {
      rbParam = { baseURI: req.config.getApiURI(), isProxy: false };
    }

    const checkParams = {
      query: {
        user_id
      }
    };

    const userRb = new UserRequestBuilder(rbParam);
    const userAction = new User(userRb);

    const rb = new OverloadRequestBuilder(rbParam);
    const action = new Overload(rb);

    const [recordsResp, fuseRecordsResp, userInfoResp] = await Promise.all([
      action.findAllByUserID(checkParams, GetOverloadsByUserIDJSONSchema),
      action.findAllFuseUserID(checkParams, GetOverloadsByUserIDJSONSchema),
      userAction.find(
        { query: { userId: match.params.user_id } },
        GetUserInfoJSONSchema
      )
    ]);

    return {
      isOtherUser: true,
      userId: user_id,
      userInfo:
        userInfoResp.type === EN_REQUEST_RESULT.SUCCESS
          ? userInfoResp.data
          : null,
      records:
        recordsResp.type === EN_REQUEST_RESULT.SUCCESS ? recordsResp.data : [],
      fuseRecords:
        fuseRecordsResp.type === EN_REQUEST_RESULT.SUCCESS
          ? fuseRecordsResp.data
          : []
    };
  }

  constructor(props: IRecordOverloadContainerProps) {
    super(props);

    this.state = {
      isServer: true,
      modalIsOpen: false
    };

    this.isLogined = this.isLogined.bind(this);
    this.getAvatar = this.getAvatar.bind(this);
    this.getTotalFuseOverTime = this.getTotalFuseOverTime.bind(this);
    this.getOverTimeRows = this.getOverTimeRows.bind(this);
    this.getFuseOverTimeRows = this.getFuseOverTimeRows.bind(this);
    this.getRemainTimes = this.getRemainTimes.bind(this);
    this.handleClickRow = this.handleClickRow.bind(this);
    this.isAdmin = this.isAdmin.bind(this);

    this.overloadStore = new OverloadStore(
      this.props.records.length > 0 ? this.props.records : [],
      this.props.fuseRecords.length > 0 ? this.props.fuseRecords : []
    );
    this.loginUserStore = new LoginStore(null);
  }

  public isLogined() {
    if (this.state.isServer === true) {
      return false;
    }
    return this.loginUserStore.isLogin;
  }

  public getAvatar(totalRemainTime: string) {
    const usedUserInfo = !!this.props.userInfo
      ? this.props.userInfo
      : this.loginUserStore.UserInfo;
    if (!!usedUserInfo) {
      const userInfo = usedUserInfo;
      return (
        <Row className="justify-content-start">
          <Col className="col-7">
            <GroupUserAvatar
              img_url={userInfo.profile_url}
              alt={userInfo.real_name}
              badge_status={null}
            />
            <span className="group-user-info">
              <span>{userInfo.real_name}</span>
              <span className="small text-muted">
                slack id: {userInfo.name}
              </span>
            </span>
          </Col>
          <Col className="col total-remain-time">
            <strong>차감 가능한 시간</strong>
            <span>{totalRemainTime}</span>
          </Col>
        </Row>
      );
    }
    return <Card>none</Card>;
  }

  private getTotalFuseOverTime() {
    if (this.overloadStore === null) {
      return luxon.Duration.fromMillis(0);
    }

    return this.overloadStore.FuseRecords.sort((a, b) =>
      a.date > b.date ? -1 : 1
    ).reduce((acc, cur) => {
      const duration = luxon.Duration.fromISO(cur.use);
      return acc.plus(duration);
    }, luxon.Duration.fromMillis(0));
  }

  public getOverTimeRows() {
    if (this.overloadStore === null) {
      return null;
    }

    const isAdmin = this.isAdmin();

    let totalFuseOverTime = this.getTotalFuseOverTime();
    const zeroDuration = luxon.Duration.fromMillis(0);

    return this.overloadStore.Records.sort((a, b) => (a.week < b.week ? -1 : 1))
      .map(mv => {
        const updateMv = { ...mv, remainTime: luxon.Duration.fromMillis(0) };
        if (!!mv.over) {
          let overTimeDuration = luxon.Duration.fromObject(mv.over);
          const isMinus = overTimeDuration.as('milliseconds') < 0;
          if (isMinus) {
            overTimeDuration = luxon.Duration.fromMillis(
              -overTimeDuration.as('milliseconds')
            );
          }
          // 남은 초과근무 소진 시간이 없는가?
          if (totalFuseOverTime <= zeroDuration) {
            updateMv.remainTime = overTimeDuration;
          } else if (totalFuseOverTime < overTimeDuration) {
            updateMv.remainTime = overTimeDuration.minus(totalFuseOverTime);
          }
          totalFuseOverTime = totalFuseOverTime.minus(overTimeDuration);
        }
        return updateMv;
      })
      .sort((a, b) => (a.week > b.week ? -1 : 1))
      .map(mv => {
        const { week } = mv;
        const startDate = luxon.DateTime.fromISO(`${week}-1`).minus({
          days: 1
        });
        const endDate = luxon.DateTime.fromISO(`${week}-6`);
        const period = `${startDate.toFormat(
          'yyyy-LL-dd'
        )} ~ ${endDate.toFormat('yyyy-LL-dd')}`;
        // mv.over가 존재하면 luxon.Duration으로 뽑아낸다.
        // 그리고 toFormat('hh:mm:ss')로 표시
        // 위와 같은 작업을 remain에도 진행한다.
        let overTimeStr = '-';
        const haveOverTime = !!mv.over;
        let isMinus = false;
        if (!!mv.over) {
          let overTimeDuration = luxon.Duration.fromObject(mv.over);
          isMinus = overTimeDuration.as('milliseconds') < 0;
          if (isMinus) {
            overTimeDuration = luxon.Duration.fromMillis(
              -overTimeDuration.as('milliseconds')
            );
          }
          overTimeStr = `${isMinus ? '-' : ''}${overTimeDuration.toFormat(
            'hh:mm:ss'
          )}`;
        }
        return (
          <tr
            key={mv.week}
            onClick={() => {
              this.handleClickRow(mv.week);
            }}
            style={{ cursor: 'pointer' }}
          >
            <td>{mv.week}</td>
            <td className="d-none d-sm-table-cell">
              <div>{period}</div>
            </td>
            <td>{overTimeStr}</td>
            <td>{`${haveOverTime && isMinus ? '-' : ''}${mv.remainTime.toFormat(
              'hh:mm:ss'
            )}`}</td>
            {isAdmin.result ? (
              <td>
                <Button
                  color="danger"
                  onClick={async e => {
                    e.stopPropagation();
                    if (
                      confirm(`${mv.week} 정산을 삭제할까요?`) &&
                      this.loginUserStore.LoginUserInfo?.id
                    ) {
                      const resp = await this.overloadStore.deleteOverWork({
                        user_id:
                          this.props.userId !== null
                            ? this.props.userId
                            : this.loginUserStore.UserInfo
                            ? this.loginUserStore.UserInfo.id
                            : 'none',
                        week: mv.week,
                        manager_id: this.loginUserStore.LoginUserInfo?.id
                      });
                      alert(
                        resp === true
                          ? `${mv.week} 정산 삭제 완료`
                          : `${mv.week} 정산 삭제 실패. 잠시후 다시 시도하세요.`
                      );
                      if (resp === true) {
                        // 정산 정보 재로딩
                        if (
                          this.props.isOtherUser === true &&
                          this.props.userId !== null
                        ) {
                          await this.overloadStore.findAllOverload(
                            this.props.userId
                          );
                        } else if (
                          Auth.isLogined === true &&
                          !!Auth.loginUserKey
                        ) {
                          await this.overloadStore.findAllOverload(
                            Auth.loginUserKey
                          );
                        }
                      }
                    }
                  }}
                >
                  X
                </Button>
              </td>
            ) : null}
          </tr>
        );
      });
  }

  public getFuseOverTimeRows() {
    if (this.overloadStore === null) {
      return null;
    }

    return this.overloadStore.FuseRecords.sort((a, b) =>
      a.date > b.date ? -1 : 1
    ).map(mv => {
      const { date, use, note } = mv;
      const useDate = luxon.DateTime.fromFormat(date, 'yyyyLLdd');
      const useDateStr = useDate.toFormat('yyyy-LL-dd');
      const duration = luxon.Duration.fromISO(use);
      const durationStr = duration.toFormat('hh:mm:ss');
      const noteStr = Util.isNotEmpty(note) ? note : '-';
      return (
        <tr key={mv.date}>
          <td>{useDateStr}</td>
          <td>{durationStr}</td>
          <td>{noteStr}</td>
        </tr>
      );
    });
  }

  public getRemainTimes() {
    if (this.overloadStore === null) {
      return '-';
    }
    const totalRemainDurationObj = this.overloadStore.totalRemain();
    if (totalRemainDurationObj === null) {
      return '-';
    }
    if (Object.keys(totalRemainDurationObj).length <= 0) {
      return '-';
    }
    let duration = luxon.Duration.fromObject(totalRemainDurationObj);
    const milliseconds = duration.as('milliseconds');
    if (milliseconds < 0) {
      duration = luxon.Duration.fromMillis(Math.abs(milliseconds));
    }
    return milliseconds < 0
      ? `-${duration.toFormat('hh:mm:ss')}`
      : duration.toFormat('hh:mm:ss');
  }

  public handleClickRow(week: string) {
    const startDate = luxon.DateTime.fromISO(`${week}-1`).minus({ days: 1 });
    const endDate = luxon.DateTime.fromISO(`${week}-6`);
    if (
      this.state.isServer === false &&
      !!this.loginUserStore &&
      !!this.loginUserStore.UserInfo
    ) {
      const id =
        this.props.isOtherUser === true
          ? this.props.userId
          : this.loginUserStore.UserInfo.id;
      const startDateStr = startDate.toFormat('yyyy-LL-dd');
      const endDateStr = endDate.toFormat('yyyy-LL-dd');
      window.location.href = `/records/${id}?startDate=${startDateStr}&endDate=${endDateStr}`;
    }
  }

  public isAdmin(): { result: boolean; id?: string } {
    // 그룹 내의 매니저 권한을 가지고 있는지 확인한다.
    if (this.isLogined() === false) {
      return { result: false };
    }
    const loginUserInfo = this.loginUserStore.LoginUserInfo;
    if (loginUserInfo === null) {
      return { result: false };
    }
    const { auth } = loginUserInfo;
    if (auth && auth >= 10) {
      return { result: true, id: loginUserInfo.id };
    }
    // 자기 자신의 정보일 때 정산 삭제 버튼 활성화
    if (
      this.props.userId === null &&
      this.loginUserStore.LoginUserInfo?.id &&
      this.loginUserStore.UserInfo?.id &&
      this.loginUserStore.LoginUserInfo?.id === this.loginUserStore.UserInfo?.id
    ) {
      return { result: true, id: this.loginUserStore.UserInfo?.id };
    }
    return { result: false };
  }

  public async componentDidMount() {
    this.setState({
      ...this.state,
      isServer: false
    });
    if (Auth.isLogined === true && !!Auth.loginUserKey) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
    }
    if (!!Auth.loginUserTokenKey) {
      await this.loginUserStore.findLoginUserInfo(Auth.loginUserTokenKey);
    }
    if (this.props.isOtherUser === true && this.props.userId !== null) {
      await this.overloadStore.findAllOverload(this.props.userId);
      await this.overloadStore.findAllFuseOverload(this.props.userId);
    } else if (Auth.isLogined === true && !!Auth.loginUserKey) {
      await this.overloadStore.findAllOverload(Auth.loginUserKey);
      await this.overloadStore.findAllFuseOverload(Auth.loginUserKey);
    }
  }

  public render() {
    const totalRemainTime = this.getRemainTimes();
    const avatar = this.getAvatar(totalRemainTime);
    const isAdmin = this.isAdmin();
    const rows = this.getOverTimeRows();
    const fuseRows = this.getFuseOverTimeRows();

    const calSpecificWeekBtn = (() => {
      if (
        this.props.isOtherUser === false &&
        this.loginUserStore.UserInfo !== null
      ) {
        return (
          <Button
            onClick={() => {
              this.setState({ ...this.state, modalIsOpen: true });
            }}
          >
            특정 주간 정산하기
          </Button>
        );
      }
      return null;
    })();

    return (
      <div className="app">
        <Helmet>
          <title>Overload</title>
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
                <h2 className="blind">사용자 정보 및 차감 가능 시간</h2>
                {avatar}
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <h2>누적된 초과 근무</h2>
              </CardHeader>
              <CardBody>
                {calSpecificWeekBtn}
                <Table responsive={true} className="d-sm-table" hover={true}>
                  <thead className="thead-light">
                    <tr>
                      <th>기록</th>
                      <th className="d-none d-sm-table-cell">기록기간</th>
                      <th>초과시간</th>
                      <th>남은시간</th>
                      {isAdmin.result ? <th>삭제</th> : null}
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <h2>사용한 초과 근무</h2>
              </CardHeader>
              <CardBody>
                <Table responsive={true} className="d-sm-table">
                  <thead className="thead-light">
                    <tr>
                      <th>사용일자</th>
                      <th>사용시간</th>
                      <th>노트</th>
                    </tr>
                  </thead>
                  <tbody>{fuseRows}</tbody>
                </Table>
              </CardBody>
            </Card>
          </Container>
          <Modal isOpen={this.state.modalIsOpen}>
            <ModalHeader>특정 주간 정산하기</ModalHeader>
            <ModalBody>
              <Formik
                initialValues={{
                  week: ''
                }}
                validate={(currentValues: FormValues) => {
                  let errors = {};
                  if (
                    /^([0-9]{4})-?W(5[0-3]|[1-4][0-9]|0[1-9])$/.test(
                      currentValues.week
                    ) === false
                  ) {
                    errors = {
                      week: '2019-W01 형식으로 정산을 원하는 주를 입력해주세요.'
                    };
                  }
                  return errors;
                }}
                onSubmit={async (currentValues: FormValues) => {
                  if (this.loginUserStore.UserInfo !== null) {
                    // 정산 요청
                    await this.overloadStore.addOverWork({
                      user_id: this.loginUserStore.UserInfo.id,
                      week: currentValues.week,
                      manager_id: this.loginUserStore.UserInfo.id
                    });
                    // 데이터 리로드
                    if (
                      this.props.isOtherUser === true &&
                      this.props.userId !== null
                    ) {
                      await this.overloadStore.findAllOverload(
                        this.props.userId
                      );
                      await this.overloadStore.findAllFuseOverload(
                        this.props.userId
                      );
                    } else if (Auth.isLogined === true && !!Auth.loginUserKey) {
                      await this.overloadStore.findAllOverload(
                        Auth.loginUserKey
                      );
                      await this.overloadStore.findAllFuseOverload(
                        Auth.loginUserKey
                      );
                    }
                    alert('완료');
                    this.setState({ ...this.state, modalIsOpen: false });
                    return;
                  }
                  alert('처리할 수 없음');
                }}
                render={(formProps: FormikProps<FormValues>) => (
                  <Form>
                    <FormGroup>
                      <Label htmlFor="breakTitle">정산하려는 주차</Label>
                      <Input
                        id="breakTitle"
                        name="week"
                        placeholder="2019-W01"
                        type="text"
                        tag={Field}
                        invalid={!!formProps.errors.week}
                      />
                      {formProps.errors.week ? (
                        <FormFeedback>{formProps.errors.week}</FormFeedback>
                      ) : null}
                    </FormGroup>
                    <Button
                      type="submit"
                      color={formProps.isValid === false ? '' : 'primary'}
                      disabled={
                        formProps.isSubmitting || formProps.isValid === false
                      }
                    >
                      요청
                    </Button>
                  </Form>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                className="btn btn-primary"
                onClick={() => {
                  this.setState({
                    ...this.state,
                    modalIsOpen: false
                  });
                }}
              >
                닫기
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    );
  }
}

export default RecordOverloadContainer;
