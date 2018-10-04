import '../../styles/style.css';

import debug from 'debug';
import { produce } from 'immer';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import {
    Button, Card, CardBody, CardFooter, Col, Container, FormGroup, Input, Label, ListGroup, Modal,
    ModalBody, ModalFooter, ModalHeader, Row, Table
} from 'reactstrap';

import { IQueue } from '../../models/user/interface/IQueue';
import { ISlackUserInfo } from '../../models/user/interface/IUserInfo';
import { User } from '../../models/user/User';
import { UserRequestBuilder } from '../../models/user/UserRequestBuilder';
import { Auth } from '../../services/auth';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../services/util';
import LoginStore from '../../stores/LoginStore';
import QueueStore from '../../stores/QueueStore';
import DefaultHeader from '../common/DefaultHeader';
import GroupUserAvatar from '../group/user/avatar';
import { IAfterRequestContext } from '../interface/IAfterRequestContext';
import QueueItem from './item';

interface States {
  isServer: boolean;
}

interface Props {
  userId: string;
  userInfo?: ISlackUserInfo;
  slackUserInfos: ISlackUserInfo[];
  queue: IQueue[];
}

const log = debug('trv:QueueAddContainer');

@observer
class QueueAddContainer extends React.Component<Props, States> {
  private loginUserStore: LoginStore;
  private queueStore: QueueStore;

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

    const userRb = new UserRequestBuilder(rbParam);
    const userAction = new User(userRb);

    const slackUserResp = await userAction.findAllSlackUsers();

    const slackUserInfos =
      slackUserResp.type === EN_REQUEST_RESULT.ERROR ? [] : slackUserResp.data;
    const userInfo: ISlackUserInfo | undefined = Util.isEmpty(slackUserInfos)
      ? undefined
      : slackUserInfos.find((fv) => fv.id === match.params.user_id);

    const ret: Props =  {
      userId: match.params.user_id,
      userInfo,
      slackUserInfos: Util.isNotEmpty(slackUserInfos) ? slackUserInfos : [],
      queue: [],
    };

    if (Util.isNotEmpty(userInfo)) {
      const findQueue = await userAction.findQueue({authId: userInfo.auth_id!});
      if (findQueue.type === EN_REQUEST_RESULT.SUCCESS) {
        ret.queue = Util.isNotEmpty(findQueue.data) ? findQueue.data : [];
      }
    }

    return ret;
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      isServer: true,
    };

    this.isLogined = this.isLogined.bind(this);
    this.getAvatar = this.getAvatar.bind(this);
    this.userQueue = this.userQueue.bind(this);
    this.onClickDeleteQueueBtn = this.onClickDeleteQueueBtn.bind(this);
    this.callNext = this.callNext.bind(this);
    this.getButton = this.getButton.bind(this);
    this.loginUserStore = new LoginStore(null);
    this.queueStore = new QueueStore(this.props.queue);
  }

  public isLogined() {
    if (this.state.isServer === true) {
      return false;
    }
    return this.loginUserStore.isLogin;
  }

  public getAvatar() {
    if (Util.isNotEmpty(this.props.userInfo)) {
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

  public userQueue() {
    const items = this.queueStore.Queue.map((mv) => {
      const props = {...mv, isOwned: this.queueStore.IsOwned};
      return <QueueItem key={mv.id} {...props} onClickDeleteBtn={this.onClickDeleteQueueBtn} />;
    });
    return (
      <ListGroup>
        {items}
      </ListGroup>
    );
  }

  private async onClickDeleteQueueBtn(id: string) {
    if (Util.isNotEmpty(this.props.userInfo) && Util.isNotEmpty(this.props.userInfo.auth_id)) {
      await this.queueStore.deleteQueue(id, this.props.userInfo.auth_id);
    }
  }

  private async callNext() {
    this.onClickDeleteQueueBtn(this.queueStore.Queue[0].id);
  }

  private getButton() {
    // 로그인 여부를 먼저 판단
    if (this.isLogined() === false) {
      return null;
    }
    // 자신의 큐인가?
    if (this.queueStore.IsOwned === true && Util.isNotEmpty(this.queueStore.Queue)) {
      return <Button onClick={this.callNext}>다음 사람 호출</Button>;
    }
    const haveUserInfo = Util.isNotEmpty(this.loginUserStore.UserInfo);
    // 타인의 큐인가?
    if (this.queueStore.IsOwned === false &&
      haveUserInfo === true) {
      return (
      <Button
        className="btn-primary"
        onClick={() => { this.queueStore.addQueue(this.props.userId, this.loginUserStore.UserInfo!.id); }}
      >
        줄서기
      </Button>);
    }
    return null;
  }

  public async componentDidMount() {
    const updateState = produce(this.state, (draft) => {
      draft.isServer = false;
    });
    this.setState(updateState);
    if (
      Auth.isLogined === true &&
      !!Auth.loginUserKey &&
      !!Auth.loginUserTokenKey
    ) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
      await this.loginUserStore.findLoginUserInfo(Auth.loginUserTokenKey);

      this.queueStore.IsOwned =
        Util.isNotEmpty(this.loginUserStore.UserInfo) && this.loginUserStore.UserInfo.id === this.props.userId;
    }
  }

  public render() {
    const avatar = this.getAvatar();
    const queue = this.userQueue();
    const button = this.getButton();
    return (
      <div className="app">
        <Helmet>
          <title>{this.props.userId} 저기요 목록</title>
        </Helmet>
        <DefaultHeader
          isLogin={this.isLogined()}
          userInfo={this.loginUserStore.UserInfo}
          onClickLogin={() => { window.location.href = '/login'; }}
          onClickLogout={() => { this.loginUserStore.logout(this.state.isServer); }}
        />
        <div className="app-body">
          <Container>
            <Card>
              <CardBody>
                {avatar}
              </CardBody>
            </Card>
            <Card>
              {button}
              <CardBody>
                {queue}
              </CardBody>
            </Card>
          </Container>
        </div>
      </div>
    );
  }
}

export default QueueAddContainer;
