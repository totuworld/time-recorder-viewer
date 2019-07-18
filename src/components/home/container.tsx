import '@coreui/icons/css/coreui-icons.min.css';
import '../../styles/style.css';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Jumbotron,
  Row
} from 'reactstrap';

import worklog from '../../assets/img/worklog.svg';
import DefaultHeader from '../common/DefaultHeader';

export default class HomeContainer extends Component {
  public render() {
    return (
      <div className="app">
        <Helmet>
          <title>Welcome to Work Log</title>
        </Helmet>
        <DefaultHeader
          isLogin={false}
          userInfo={null}
          onClickLogin={() => {
            window.location.href = '/login';
          }}
          onClickLogout={() => {
            console.log('test');
          }}
        />
        <div className="app-body">
          <Container>
            <Jumbotron className="bg-white">
              <img src={worklog} width="280" alt="Work log logo" />
              <p className="lead">
                유연한 업무 환경 조성을 돕고, 주 40시간 근무를 수호합니다
              </p>
              <hr className="my-4" />
              <p>
                간편하게 출퇴근 체크가 가능합니다.
                <br />
                워크로그를 시작해보세요.
              </p>
              <Button className="btn btn-primary btn-lg" href="/login">
                가입 후 시작하기
              </Button>
            </Jumbotron>
            <Row>
              <Col md={true}>
                <Card>
                  <CardHeader>
                    <h3>👋 출/퇴근 로그</h3>
                  </CardHeader>
                  <CardBody>출근했을 때 출근, 퇴근할 땐 퇴근</CardBody>
                </Card>
              </Col>
              <Col md={true}>
                <Card>
                  <CardHeader>
                    <h3>🤮 초과 근무 관리</h3>
                  </CardHeader>
                  <CardBody>초과 근무가 주단위로 누적됩니다.</CardBody>
                </Card>
              </Col>
              <Col md={true}>
                <Card>
                  <CardHeader>
                    <h3>🛠 노동자 우선</h3>
                  </CardHeader>
                  <CardBody>만든이도 쓰는이도 노동자입니다.</CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}
