import '@coreui/icons/css/coreui-icons.min.css';
import '../../styles/style.css';

import React, { Component } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Row
} from 'reactstrap';
import {
  appTokenKey,
  firebaseAuthKey,
  loginUserKey
} from '../../constants/constants';
import { PostLoginUserJSONSchema } from '../../models/user/JSONSchema/PostLoginUserJSONSchema';
import { User } from '../../models/user/User';
import { UserRequestBuilder } from '../../models/user/UserRequestBuilder';
import { Auth } from '../../services/auth';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';

const DEFAULT_PAGE = '/';

class Login extends Component {
  constructor(props: any) {
    super(props);

    this.clickLogin = this.clickLogin.bind(this);
    this.getReturnUrl = this.getReturnUrl.bind(this);
  }

  public clickLogin() {
    Auth.firebaseAuth()
      .signInWithPopup(Auth.googleProvider)
      .catch(_ => {
        localStorage.removeItem(firebaseAuthKey);
      });
    localStorage.setItem(firebaseAuthKey, '1');
  }

  private getReturnUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUri = urlParams.get('redirect_uri');
    if (urlParams.has('redirect_uri') && !!redirectUri) {
      return redirectUri;
    }
    return DEFAULT_PAGE;
  }

  public componentDidMount() {
    if (
      localStorage.getItem(appTokenKey) &&
      localStorage.getItem(loginUserKey)
    ) {
      const userKey = localStorage.getItem(loginUserKey);
      window.location.href = !!userKey
        ? `/records/${userKey}`
        : this.getReturnUrl();
      return;
    }

    Auth.firebaseAuth().onAuthStateChanged(user => {
      if (!!user) {
        // console.log('User signed in: ', JSON.stringify(user));

        localStorage.removeItem(firebaseAuthKey);

        // here you could authenticate with you web server to get the
        // application specific token so that you do not have to
        // authenticate with firebase every time a user logs in
        const rbParam: RequestBuilderParams = { isProxy: true };
        const rb = new UserRequestBuilder(rbParam);
        const action = new User(rb);
        const checkParams = {
          body: {
            userUid: user.uid,
            email: user.email
          }
        };
        action
          .addLoginUser(checkParams, PostLoginUserJSONSchema)
          .then(result => {
            let returnUrl = this.getReturnUrl();
            localStorage.setItem(appTokenKey, user.uid);
            if (
              result.type === EN_REQUEST_RESULT.SUCCESS &&
              !!result.data &&
              !!result.data.userKey
            ) {
              localStorage.setItem(loginUserKey, result.data.userKey);
              // 기본 url인 경우 바꾸도록 한다.
              if (returnUrl === DEFAULT_PAGE) {
                returnUrl = `/records/${result.data.userKey}`;
              }
            }
            // 가입이 실패했는지 확인한다.
            if (returnUrl === DEFAULT_PAGE && !!result.data.userKey === false) {
              alert(
                '회원 가입이 실패했습니다. 잠시 후 재시도하시거나 관리자에게 문의해주세요.'
              );
            }
            window.location.href = returnUrl;
          });
      }
    });
  }

  public render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card>
                  <CardBody className="text-center">
                    구글 계정으로 시작할 수 있습니다.
                  </CardBody>
                </Card>
                <Card>
                  <CardBody className="text-center">
                    <div>
                      <Button
                        className="btn-google-plus btn-brand"
                        active={true}
                        onClick={this.clickLogin}
                      >
                        <i className="fa fa-google-plus" />
                        <span>Log in with Google</span>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
