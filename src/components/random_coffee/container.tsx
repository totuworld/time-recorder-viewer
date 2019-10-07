import '@coreui/icons/css/coreui-icons.min.css';
import '../../styles/style.css';

import * as debug from 'debug';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { NavLink } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Container,
  ListGroup,
  ListGroupItem
} from 'reactstrap';

import { JSCFindAllEvent } from '../../models/event/JSONSchema/JSCFindAllEvent';
import { IRandomCoffeeEvent } from '../../models/random_coffee/interface/IRandomCoffeeEvent';
import { RandomCoffee } from '../../models/random_coffee/random_coffee';
import { RandomCoffeeRequestBuilder } from '../../models/random_coffee/random_coffee.rb';
import { Auth } from '../../services/auth';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../services/util';
import LoginStore from '../../stores/LoginStore';
import RandomCoffeeEventListStore from '../../stores/RandomCoffeeListStore';
import DefaultHeader from '../common/DefaultHeader';
import { IAfterRequestContext } from '../interface/IAfterRequestContext';

interface IState {
  isServer: boolean;
}

interface IProp {
  eventList: IRandomCoffeeEvent[];
}

const log = debug('trv:RandomCoffeeContainer');

@observer
export default class RandomCoffeeContainer extends React.Component<
  IProp,
  IState
> {
  private loginUserStore: LoginStore;
  private eventListStore: RandomCoffeeEventListStore;

  public static async getInitialProps(args: IAfterRequestContext<{}>) {
    log(!!args.req && !!args.req.config);
    let rbParam: RequestBuilderParams = { isProxy: true };
    if (!!args.req && !!args.req.config) {
      rbParam = { baseURI: args.req.config.getApiURI(), isProxy: false };
    }
    const rb = new RandomCoffeeRequestBuilder(rbParam);
    const action = new RandomCoffee(rb);
    const result = await action.findAll(
      { query: { page: 1, limit: 10 } },
      JSCFindAllEvent
    );

    return {
      eventList: result.type === EN_REQUEST_RESULT.SUCCESS ? result.data : []
    };
  }

  constructor(props: IProp) {
    super(props);

    this.state = {
      isServer: true
    };

    this.isLogined = this.isLogined.bind(this);
    this.loginUserStore = new LoginStore(null);
    this.eventListStore = new RandomCoffeeEventListStore(this.props.eventList);
    this.getRows = this.getRows.bind(this);
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
    if (Auth.isLogined === true && !!Auth.loginUserKey) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
    }
    if (Util.isEmpty(this.eventListStore.Events)) {
      this.eventListStore.Events = Util.isNotEmpty(this.props.eventList)
        ? this.props.eventList
        : [];
    }
  }

  public getRows() {
    const targetEvents = Util.isNotEmpty(this.eventListStore.Events)
      ? this.eventListStore.Events
      : Util.isNotEmpty(this.props.eventList)
      ? this.props.eventList
      : [];
    const result = targetEvents.map(mv => {
      const targetPath = `/random_coffee/${mv.id}`;
      return (
        <ListGroupItem key={mv.id}>
          <span>{mv.title}</span>
          <span className="list-group-button">
            <Button href={targetPath}>살펴보기</Button>
          </span>
        </ListGroupItem>
      );
    });
    result.push(<Button>+ 리스트 더보기</Button>);
    return result;
  }

  public render() {
    const rows = this.getRows();
    const addMenu = this.isLogined() ? (
      <Card>
        <NavLink to="/random_coffee/add">
          <h3>랜덤커피 이벤트 추가</h3>
        </NavLink>
      </Card>
    ) : null;
    return (
      <div className="app">
        <Helmet>
          <title>랜덤커피 목록</title>
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
            {addMenu}
            <Card>
              <CardBody>
                <ListGroup>{rows}</ListGroup>
              </CardBody>
            </Card>
          </Container>
        </div>
      </div>
    );
  }
}
