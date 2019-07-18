import '@coreui/icons/css/coreui-icons.min.css';
import '../../../styles/style.css';

import * as luxon from 'luxon';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Button, Card, CardHeader, Container } from 'reactstrap';

import { Auth } from '../../../services/auth';
import LoginStore from '../../../stores/LoginStore';
import RandomCoffeeEventAddStore from '../../../stores/RandomCoffeeEventAddStore';
import DefaultHeader from '../../common/DefaultHeader';
import { CreateRandomCoffeeEventItem } from './create_rc_event';

interface IState {
  isServer: boolean;
  step: number;
  firstData: FormValues;
}

interface FormValues {
  title: string;
  desc: string;
  private: boolean;
  endOfRegister: string;
}

@observer
export default class RandomCoffeeAddContainer extends React.Component<
  {},
  IState
> {
  private loginUserStore: LoginStore;
  private eventAddStore: RandomCoffeeEventAddStore;

  constructor(props: {}) {
    super(props);

    this.state = {
      isServer: true,
      step: 1,
      firstData: {
        title: '',
        desc: '',
        private: false,
        endOfRegister: ''
      }
    };

    this.isLogined = this.isLogined.bind(this);
    this.setStepOneData = this.setStepOneData.bind(this);
    this.loginUserStore = new LoginStore(null);
    this.eventAddStore = new RandomCoffeeEventAddStore();
  }

  public isLogined() {
    if (this.state.isServer === true) {
      return false;
    }
    return this.loginUserStore.isLogin;
  }

  public setStepOneData(values: FormValues) {
    this.setState({
      ...this.state,
      step: 2,
      firstData: { ...values }
    });
  }

  public async componentDidMount() {
    this.setState({
      ...this.state,
      isServer: false
    });
    if (Auth.isLogined === true && !!Auth.loginUserKey) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
    }
  }

  public render() {
    const cardBodyElement =
      this.state.step === 1 ? (
        <CreateRandomCoffeeEventItem handleSubmit={this.setStepOneData} />
      ) : (
        <>
          <Button
            onClick={async () => {
              if (!!this.loginUserStore.UserInfo) {
                const result = await this.eventAddStore.createEvent({
                  title: this.state.firstData.title,
                  desc: this.state.firstData.desc,
                  private: this.state.firstData.private,
                  owner: this.loginUserStore.UserInfo,
                  last_register: luxon.DateTime.fromISO(
                    this.state.firstData.endOfRegister
                  ).toISO()
                });
                if (result !== null) {
                  window.location.href = `/random_coffee/${result}`;
                }
              }
            }}
          >
            이벤트 생성
          </Button>
        </>
      );
    return (
      <div className="app">
        <Helmet>
          <title>test</title>
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
                <h3>새로운 ️️랜덤커피 이벤트</h3>
              </CardHeader>
              {cardBodyElement}
            </Card>
          </Container>
        </div>
      </div>
    );
  }
}
