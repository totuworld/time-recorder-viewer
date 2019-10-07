import '@coreui/icons/css/coreui-icons.min.css';
import '../../../styles/style.css';

import * as debug from 'debug';
import { DateTime } from 'luxon';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Button, Card, CardHeader, Container } from 'reactstrap';

import { JSCFindEvent } from '../../../models/event/JSONSchema/JSCFindEvent';
import { IRandomCoffeeEvent } from '../../../models/random_coffee/interface/IRandomCoffeeEvent';
import { RandomCoffee } from '../../../models/random_coffee/random_coffee';
import { RandomCoffeeRequestBuilder } from '../../../models/random_coffee/random_coffee.rb';
import { Auth } from '../../../services/auth';
import { RequestBuilderParams } from '../../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../../services/util';
import LoginStore from '../../../stores/LoginStore';
import RandomCoffeeEventDetailStore from '../../../stores/RandomCoffeeEventDetailStore';
import DefaultHeader from '../../common/DefaultHeader';
import { IAfterRequestContext } from '../../interface/IAfterRequestContext';

interface IProp {
  info: IRandomCoffeeEvent | null;
}

interface IState {
  isServer: boolean;
}

const log = debug('trv:RandomCoffeeDetailContainer');

@observer
export default class RandomCoffeeDetailContainer extends React.Component<
  IProp,
  IState
> {
  private loginUserStore: LoginStore;
  private detailStore: RandomCoffeeEventDetailStore;

  public static async getInitialProps({
    req,
    match
  }: IAfterRequestContext<{ event_id: string }>) {
    log(match.params.event_id);
    log(!!req && !!req.config);
    let rbParam: RequestBuilderParams = { isProxy: true };
    if (!!req && !!req.config) {
      rbParam = { baseURI: req.config.getApiURI(), isProxy: false };
    }

    const eventRb = new RandomCoffeeRequestBuilder(rbParam);
    const eventAction = new RandomCoffee(eventRb);

    const eventInfo = await eventAction.find(
      { params: { event_id: match.params.event_id } },
      JSCFindEvent
    );

    const ret: IProp = {
      info:
        eventInfo.type === EN_REQUEST_RESULT.SUCCESS && !!eventInfo.data
          ? eventInfo.data
          : null
    };
    return ret;
  }

  constructor(props: IProp) {
    super(props);

    this.state = {
      isServer: true
    };
    this.loginUserStore = new LoginStore(null);
    this.detailStore = new RandomCoffeeEventDetailStore({
      eventInfo: this.props.info
    });

    this.isLogined = this.isLogined.bind(this);
  }

  private isLogined() {
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
    if (Auth.isLogined === true && !!Auth.loginUserKey) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
      await this.detailStore.checkUserRegister(Auth.loginUserKey);
    }
  }

  public render() {
    const disTitle = Util.isNotEmpty(this.detailStore)
      ? this.detailStore.Info.title !== '?'
        ? this.detailStore.Info.title
        : !!this.props.info
        ? this.props.info.title
        : ''
      : !!this.props.info
      ? this.props.info.title
      : '';
    const disDesc = Util.isNotEmpty(this.detailStore)
      ? this.detailStore.Info.desc !== '?'
        ? this.detailStore.Info.desc
        : !!this.props.info
        ? this.props.info.desc
        : ''
      : !!this.props.info
      ? this.props.info.desc
      : '';
    const disEndOfReg = Util.isNotEmpty(this.detailStore)
      ? Util.isNotEmpty(this.detailStore.Info.last_register)
        ? DateTime.fromJSDate(this.detailStore.Info.last_register).toISO()
        : !!this.props.info
        ? typeof this.detailStore.Info.last_register === 'string'
          ? this.detailStore.Info.last_register
          : DateTime.fromJSDate(this.detailStore.Info.last_register).toISO()
        : ''
      : !!this.props.info
      ? typeof this.props.info.last_register === 'string'
        ? this.props.info.last_register
        : DateTime.fromJSDate(this.props.info.last_register).toISO()
      : '';
    const loginBtn = this.isLogined() ? (
      this.state.isServer === false &&
      this.detailStore.UserRegister === false ? (
        <Button> 등록하기 </Button>
      ) : (
        <Button> 해지하기 </Button>
      )
    ) : (
      <Button
        href={`/login?redirect_uri=/random_coffee/${this.props.info!.id}`}
      >
        로그인
      </Button>
    );
    return (
      <div className="app">
        <Helmet>
          <title>☕️: {disTitle}</title>
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
              <CardHeader>
                <h3>{disTitle}</h3>
                <p>{disDesc}</p>
                <p>종료: {disEndOfReg}</p>
              </CardHeader>
            </Card>
            <Card>
              {loginBtn}
              {'참가 여부 노출'}
              {'참가하기 버튼 노출'}
            </Card>
          </Container>
        </div>
      </div>
    );
  }
}
