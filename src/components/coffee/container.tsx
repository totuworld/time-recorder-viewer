import '@coreui/icons/css/coreui-icons.min.css';
import '../../styles/style.css';

import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Container } from 'reactstrap';

import { Auth } from '../../services/auth';
import LoginStore from '../../stores/LoginStore';
import DefaultHeader from '../common/DefaultHeader';

interface IState {
  isServer: boolean;
}

@observer
export default class CoffeeContainer extends React.Component<{}, IState> {
  private loginUserStore: LoginStore;

  constructor(props: {}) {
    super(props);

    this.state = {
      isServer: true
    };

    this.isLogined = this.isLogined.bind(this);
    this.loginUserStore = new LoginStore(null);
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
  }

  public render() {
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
          <Container>hey</Container>
        </div>
      </div>
    );
  }
}
