import '../../../styles/style.css';

import debug from 'debug';
import * as luxon from 'luxon';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
  Table
} from 'reactstrap';

import { IFuseToVacationRead } from '../../../models/time_record/interface/IOverWork';
import { JSCFindAllFuseToVacation } from '../../../models/time_record/JSONSchema/JSCFindAllFuseToVacation';
import { Overload } from '../../../models/time_record/Overload';
import { OverloadRequestBuilder } from '../../../models/time_record/OverloadRequestBuilder';
import { IUserInfo } from '../../../models/user/interface/IUserInfo';
import { GetUserInfoJSONSchema } from '../../../models/user/JSONSchema/GetUserInfoJSONSchema';
import { User } from '../../../models/user/User';
import { UserRequestBuilder } from '../../../models/user/UserRequestBuilder';
import { Auth } from '../../../services/auth';
import { RequestBuilderParams } from '../../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';
import FuseToVacationStore from '../../../stores/FuseToVacationStore';
import LoginStore from '../../../stores/LoginStore';
import DefaultHeader from '../../common/DefaultHeader';
import GroupUserAvatar from '../../group/user/avatar';
import { IAfterRequestContext } from '../../interface/IAfterRequestContext';

const log = debug('trv:recordFuseVacationContainer');

interface IRecordOverloadContainerProps {
  isOtherUser: boolean;
  userId: string | null;
  userInfo: IUserInfo | null;
  records: IFuseToVacationRead[];
}

interface IRecordOverloadContainerStates {
  isServer: boolean;
}

@observer
class RecordFuseVacationContainer extends React.Component<
  IRecordOverloadContainerProps,
  IRecordOverloadContainerStates
> {
  private fuseToVacationStore: FuseToVacationStore;
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
        records: []
      };
    }

    let rbParam: RequestBuilderParams = { isProxy: true };
    if (!!req && !!req.config) {
      rbParam = { baseURI: req.config.getApiURI(), isProxy: false };
    }

    const checkParams = {
      params: {
        user_id
      }
    };

    const userRb = new UserRequestBuilder(rbParam);
    const userAction = new User(userRb);

    const rb = new OverloadRequestBuilder(rbParam);
    const action = new Overload(rb);

    const [recordsResp, userInfoResp] = await Promise.all([
      action.findAllFuseToVacationByUserID(
        checkParams,
        JSCFindAllFuseToVacation
      ),
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
        recordsResp.type === EN_REQUEST_RESULT.SUCCESS && recordsResp.data
          ? recordsResp.data
          : []
    };
  }

  constructor(props: IRecordOverloadContainerProps) {
    super(props);

    this.state = {
      isServer: true
    };

    this.isLogined = this.isLogined.bind(this);
    this.getAvatar = this.getAvatar.bind(this);
    this.getFuseToVacationRows = this.getFuseToVacationRows.bind(this);
    this.handleClickRow = this.handleClickRow.bind(this);

    this.fuseToVacationStore = new FuseToVacationStore(this.props.records);
    this.loginUserStore = new LoginStore(null);
  }

  public isLogined() {
    if (this.state.isServer === true) {
      return false;
    }
    return this.loginUserStore.isLogin;
  }

  public getAvatar() {
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
        </Row>
      );
    }
    return <Card>none</Card>;
  }

  public getFuseToVacationRows() {
    if (this.fuseToVacationStore === null) {
      return null;
    }

    return this.fuseToVacationStore.Records.map(mv => {
      return (
        <tr
          key={mv.key}
          onClick={() => {
            if (mv.addLogDate) {
              this.handleClickRow(mv.addLogDate);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <td>{mv.expireDate}</td>
          <td className="d-none d-sm-table-cell">
            <div>{mv.created}</div>
          </td>
          <td>{mv.note}</td>
          <td>{mv.used ? 'O' : 'X'}</td>
          <td>{mv.expireNote ? mv.expireNote : '-'}</td>
          <td className="d-none d-sm-table-cell">
            {mv.expireByAdminTimeStamp ? mv.expireByAdminTimeStamp : '-'}
          </td>
        </tr>
      );
    });
  }

  public handleClickRow(date: string) {
    const startDate = luxon.DateTime.fromFormat(date, 'yyyyLLdd');
    if (
      this.state.isServer === false &&
      !!this.loginUserStore &&
      !!this.loginUserStore.UserInfo
    ) {
      const id = this.props.userId;
      const startDateStr = startDate.toFormat('yyyy-LL-dd');
      window.location.href = `/records/${id}?startDate=${startDateStr}&endDate=${startDateStr}`;
    }
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
    if (this.props.userId !== null) {
      await this.fuseToVacationStore.findAllFuseToVacation(this.props.userId);
    }
  }

  public render() {
    const totalRemain = (() => {
      if (this.fuseToVacationStore === null) {
        return 0;
      }
      return this.fuseToVacationStore.Records.reduce((acc, cur) => {
        if (cur.used === false) {
          return acc + 1;
        }
        return acc;
      }, 0);
    })();
    const usedVacation = (() => {
      if (this.fuseToVacationStore === null) {
        return 0;
      }
      return this.fuseToVacationStore.Records.length - totalRemain;
    })();
    const expireNominateVacation = (() => {
      if (this.fuseToVacationStore === null) {
        return 0;
      }
      const nowFrom30days = luxon.DateTime.local().plus({ days: 30 });
      return this.fuseToVacationStore.Records.filter(fv => {
        const available = fv.used === false;
        const expireDate = luxon.DateTime.fromFormat(
          fv.expireDate,
          'yyyy-LL-dd'
        );
        const expire = nowFrom30days > expireDate;
        return available && expire;
      }).length;
    })();
    const avatar = this.getAvatar();
    const rows = this.getFuseToVacationRows();
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
              <CardBody>{avatar}</CardBody>
            </Card>
            <Card>
              <CardBody>
                <Row>
                  <Col md={true} className="mb-sm-2 mb-0">
                    <div className="callout callout-primary">
                      <div className="text-muted">{totalRemain}</div>
                      <div>남은 휴가</div>
                    </div>
                  </Col>
                  <Col md={true} className="mb-sm-2 mb-0">
                    <div className="callout callout-warning">
                      <div className="text-muted">{usedVacation}</div>
                      <div>사용한/만료된 휴가</div>
                    </div>
                  </Col>
                  <Col md={true} className="mb-sm-2 mb-0">
                    <div className="callout callout-danger">
                      <div className="text-muted">{expireNominateVacation}</div>
                      <div>30일내 만료되는 휴가</div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <h2>휴가 금고</h2>
              </CardHeader>
              <CardBody>
                <Table responsive={true} className="d-sm-table" hover={true}>
                  <thead className="thead-light">
                    <tr>
                      <th>만료일자</th>
                      <th className="d-none d-sm-table-cell">생성일자</th>
                      <th>생성사유</th>
                      <th>사용여부</th>
                      <th>만료사유</th>
                      <th className="d-none d-sm-table-cell">만료 실행일자</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
              </CardBody>
            </Card>
          </Container>
        </div>
      </div>
    );
  }
}

export default RecordFuseVacationContainer;
