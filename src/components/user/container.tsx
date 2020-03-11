import '../../styles/style.css';

import debug from 'debug';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Container,
  Input,
  ListGroup,
  ListGroupItem,
  Row
} from 'reactstrap';

import { ILoginUserInfo } from '../../models/user/interface/ILoginUser';
import { IUserInfo } from '../../models/user/interface/IUserInfo';
import { GetUserInfoJSONSchema } from '../../models/user/JSONSchema/GetUserInfoJSONSchema';
import { User } from '../../models/user/User';
import { UserRequestBuilder } from '../../models/user/UserRequestBuilder';
import { Auth } from '../../services/auth';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../services/util';
import LoginStore from '../../stores/LoginStore';
import DefaultHeader from '../common/DefaultHeader';
import GroupUserAvatar from '../group/user/avatar';
import { IAfterRequestContext } from '../interface/IAfterRequestContext';

const log = debug('trv:UserContainer');

interface IRecordContainerProps {
  userId: string;
  userInfo: IUserInfo | null;
  loginUserInfo: ILoginUserInfo | null;
}

interface IStates {
  isServer: boolean;
  isModalOpen: boolean;
  targetUserId: string;
}

@observer
class UserContainer extends React.Component<IRecordContainerProps, IStates> {
  private loginUserStore: LoginStore;

  public static async getInitialProps({
    req,
    match
  }: IAfterRequestContext<{ user_id: string }>) {
    log(match.params.user_id);
    log(!!req && !!req.config);
    let rbParam: RequestBuilderParams = { isProxy: true };
    if (!!req && !!req.config) {
      rbParam = { baseURI: req.config.getApiURI(), isProxy: false };
    }
    let userInfo: IUserInfo | null = null;
    let loginUserInfo: ILoginUserInfo | null = null;
    const userRb = new UserRequestBuilder(rbParam);
    const userAction = new User(userRb);
    const userInfoResp = await userAction.find(
      { query: { userId: match.params.user_id } },
      GetUserInfoJSONSchema
    );
    if (userInfoResp.type === EN_REQUEST_RESULT.SUCCESS) {
      userInfo = userInfoResp.data;
    }

    if (userInfo !== null && !!userInfo.userUid) {
      const loginUserInfoResp = await userAction.findLoginUser({
        user_uid: userInfo.userUid
      });
      if (
        loginUserInfoResp.type === EN_REQUEST_RESULT.SUCCESS &&
        Util.isNotEmpty(loginUserInfoResp.data) &&
        Util.isNotEmpty(loginUserInfoResp.data.data)
      ) {
        const updateLoginInfo: ILoginUserInfo = {
          ...loginUserInfoResp.data.data,
          user_uid: userInfo.userUid
        };
        loginUserInfo = updateLoginInfo;
      }
    }

    return {
      userId: match.params.user_id,
      userInfo,
      loginUserInfo
    };
  }

  public constructor(props: IRecordContainerProps) {
    super(props);

    this.state = {
      isServer: true,
      isModalOpen: false,
      targetUserId: ''
    };

    this.getAvatar = this.getAvatar.bind(this);
    this.isLogined = this.isLogined.bind(this);

    this.loginUserStore = new LoginStore(null);
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
    if (
      Auth.isLogined === true &&
      !!Auth.loginUserKey &&
      !!Auth.loginUserTokenKey
    ) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
      await this.loginUserStore.findLoginUserInfo(Auth.loginUserTokenKey);
    }
  }

  public render() {
    const avatar = this.getAvatar();
    const { name, userId, auth_id } = (() => {
      if (this.props.userInfo !== null) {
        return {
          name: this.props.userInfo.real_name,
          userId: this.props.userInfo.id,
          auth_id: this.props.userInfo.userUid,
          profile: this.props.userInfo.profile_url
        };
      }
      return {
        name: '',
        userId: this.props.userId,
        auth_id: '',
        profile: ''
      };
    })();
    const targetUserHaveAuth =
      !!this.props.loginUserInfo &&
      !!this.props.loginUserInfo.auth &&
      this.props.loginUserInfo.auth === 10;
    // console.log(this.loginUserStore.LoginUserInfo?.id);
    const haveAuth =
      this.state.isServer === false &&
      !!Auth.loginUserTokenKey &&
      !!this.loginUserStore.LoginUserInfo &&
      !!this.loginUserStore.LoginUserInfo.auth &&
      this.loginUserStore.LoginUserInfo.auth === 10;

    const invalidInput = this.state.targetUserId.trim().length < 9;
    return (
      <div className="app">
        <Helmet>
          <title>{name} Info</title>
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
              <CardHeader>{avatar}</CardHeader>
              <ListGroup className="list-group-flush">
                <ListGroupItem>
                  <Row className="justify-content-start">
                    <Col className="col-md-6">
                      <div>{userId}</div>
                      <div className="small text-muted">slack user id</div>
                    </Col>
                  </Row>
                </ListGroupItem>
                <ListGroupItem>
                  <Row className="justify-content-start">
                    <Col className="col-md-6">
                      <div>{auth_id}</div>
                      <div className="small text-muted">auth id</div>
                    </Col>
                  </Row>
                </ListGroupItem>
                <ListGroupItem>
                  <Row className="justify-content-start">
                    <Col className="col-md-6">
                      <div>{`${targetUserHaveAuth}`}</div>
                      <div className="small text-muted">
                        관리자 권한 보유 여부
                      </div>
                      {targetUserHaveAuth && haveAuth ? (
                        <Button
                          disabled={!targetUserHaveAuth && haveAuth}
                          color="danger"
                          onClick={async () => {
                            if (
                              confirm(
                                `${this.props.userId} (${this.props.userInfo?.real_name}) 관리자 권한 제거 하시겠습니까?`
                              )
                            ) {
                              const resp = await this.loginUserStore.deactiveAdminRole(
                                {
                                  userId: this.props.userId
                                }
                              );
                              if (resp) {
                                alert('관리자 권한 제거 성공\n페이지 리로드');
                                window.location.href = `/user/${this.props.userId}`;
                                return;
                              }
                              alert('관리자 권한 제거 성공\n잠시후 재시도');
                            }
                          }}
                        >
                          사용자 권한 제거
                        </Button>
                      ) : null}
                    </Col>
                  </Row>
                </ListGroupItem>
              </ListGroup>
            </Card>
            {haveAuth &&
            this.loginUserStore.LoginUserInfo?.user_uid ===
              this.props.userInfo?.userUid ? (
              <Card>
                <CardHeader>특정 사용자 관리자 권한 부여하기</CardHeader>
                <CardBody>
                  <Input
                    placeholder="사용자 slack user id 입력"
                    invalid={invalidInput}
                    value={this.state.targetUserId}
                    onChange={e => {
                      const currentValue = e.currentTarget.value;
                      this.setState({
                        ...this.state,
                        targetUserId: currentValue
                      });
                    }}
                  />
                </CardBody>
                <CardFooter>
                  <Button
                    disabled={invalidInput}
                    color="primary"
                    onClick={async () => {
                      if (this.state.targetUserId.trim().length === 9) {
                        const resp = await this.loginUserStore.activeAdminRole({
                          userId: this.state.targetUserId.trim()
                        });
                        if (resp) {
                          alert('권한 부여 성공\n페이지 리다이렉트');
                          window.location.href = `/user/${this.state.targetUserId}`;
                          return;
                        }
                        alert('권한 부여 실패\n잠시후 재시도');
                      }
                    }}
                  >
                    권한 부여
                  </Button>
                </CardFooter>
              </Card>
            ) : null}
          </Container>
        </div>
      </div>
    );
  }
}

export default UserContainer;
