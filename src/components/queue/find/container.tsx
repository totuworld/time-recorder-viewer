import '../../../styles/style.css';

import debug from 'debug';
import { produce } from 'immer';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  Input,
  InputGroup,
  InputGroupAddon,
  ListGroup,
} from 'reactstrap';

import cow from '../../../assets/img/cow.svg';
import { ISlackUserInfo } from '../../../models/user/interface/IUserInfo';
import { User } from '../../../models/user/User';
import { UserRequestBuilder } from '../../../models/user/UserRequestBuilder';
import { Auth } from '../../../services/auth';
import { RequestBuilderParams } from '../../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../../services/util';
import LoginStore from '../../../stores/LoginStore';
import DefaultHeader from '../../common/DefaultHeader';
import { IAfterRequestContext } from '../../interface/IAfterRequestContext';
import QueueFindItem from './item';

interface States {
  isServer: boolean;
  inputTxt: string;
  matchUsers: ISlackUserInfo[];
}

interface Props {
  slackUserInfos: ISlackUserInfo[];
}

const log = debug('trv:QueueFindContainer');

@observer
class QueueFindContainer extends React.Component<Props, States> {
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

    const userRb = new UserRequestBuilder(rbParam);
    const userAction = new User(userRb);

    const slackUserResp = await userAction.findAllSlackUsers();

    const slackUserInfos =
      slackUserResp.type === EN_REQUEST_RESULT.ERROR ? [] : slackUserResp.data;

    const ret: Props = {
      slackUserInfos: Util.isNotEmpty(slackUserInfos) ? slackUserInfos : []
    };

    return ret;
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      isServer: true,
      inputTxt: '',
      matchUsers: []
    };

    this.isLogined = this.isLogined.bind(this);
    this.getMatchItems = this.getMatchItems.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.loginUserStore = new LoginStore(null);
  }

  public isLogined() {
    if (this.state.isServer === true) {
      return false;
    }
    return this.loginUserStore.isLogin;
  }

  private getMatchItems() {
    if (Util.isEmpty(this.state.matchUsers)) {
      const msg = '검색하소!';
      return (
        <div>
          <p className="text-center">{msg}</p>
          <img className="mx-auto d-block" src={cow} width="40%" />
        </div>
      );
    }
    return this.state.matchUsers.map((mv) => {
      return <QueueFindItem key={mv.id} {...mv} />;
    });
  }

  private onChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const updateState = produce(this.state, (draft) => {
      const searchValue = e.currentTarget.value;
      draft.inputTxt = searchValue;
      if (
        Util.isNotEmpty(this.props.slackUserInfos) &&
        searchValue.length > 0
      ) {
        draft.matchUsers = this.props.slackUserInfos.filter(
          (fv) =>
            fv.real_name.includes(searchValue) || fv.name.includes(searchValue)
        );
      }
      if (searchValue.length <= 0) {
        draft.matchUsers = [];
      }
    });
    this.setState(updateState);
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
    }
  }

  public render() {
    const items = this.getMatchItems();
    return (
      <div className="app">
        <Helmet>
          <title>저기요</title>
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
              <CardHeader>
                <CardTitle>
                  저기요
                </CardTitle>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">사람 찾기</InputGroupAddon>
                  <Input
                    type="text"
                    id="time-input"
                    name="text-input"
                    placeholder="찾을 사람 이름 or ID 넣기"
                    value={this.state.inputTxt}
                    onChange={this.onChangeInput}
                  />
                </InputGroup>
              </CardHeader>
              <CardBody>
                <ListGroup>{items}</ListGroup>
              </CardBody>
              <CardFooter>
                저기요는 개인 사용자의 비동기 커뮤니케이션을 돕는 서비스입니다.
                <br />
                원하는 사용자를 선택한 뒤 줄서기 해보세요.
              </CardFooter>
            </Card>
          </Container>
        </div>
      </div>
    );
  }
}

export default QueueFindContainer;
