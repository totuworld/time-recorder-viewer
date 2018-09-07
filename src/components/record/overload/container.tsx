import '../../../styles/style.css';

import debug from 'debug';
import * as luxon from 'luxon';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardBody, CardHeader, Col, Container, Row, Table } from 'reactstrap';

import { Auth } from '../../../services/auth';
import { Util } from '../../../services/util';
import LoginStore from '../../../stores/LoginStore';
import OverloadStore from '../../../stores/OverloadStore';
import DefaultHeader from '../../common/DefaultHeader';
import GroupUserAvatar from '../../group/user/avatar';

const log = debug('trv:recordOverloadContainer');

interface IRecordOverloadContainerStates {
  isServer: boolean;
}

@observer
class RecordOverloadContainer extends React.Component<any, IRecordOverloadContainerStates> {
  private overloadStore: OverloadStore;
  private loginUserStore: LoginStore;

  constructor(props: any) {
    super(props);

    this.state = {
      isServer: true,
    };

    this.isLogined = this.isLogined.bind(this);
    this.getAvatar = this.getAvatar.bind(this);
    this.getOverTimeRows = this.getOverTimeRows.bind(this);
    this.getFuseOverTimeRows = this.getFuseOverTimeRows.bind(this);
    this.getRemainTimes = this.getRemainTimes.bind(this);
    this.handleClickRow = this.handleClickRow.bind(this);

    this.overloadStore = new OverloadStore();
    this.loginUserStore = new LoginStore(null);
  }

  public isLogined() {
    if (this.state.isServer === true) {
      return false;
    }
    return this.loginUserStore.isLogin;
  }

  public getAvatar() {
    if (!!this.loginUserStore.UserInfo) {
      const userInfo = this.loginUserStore.UserInfo;
      return (
        <Row className="justify-content-start">
          <Col className="col-sm-1">
            <GroupUserAvatar
              img_url={userInfo.profile_url}
              alt={userInfo.real_name}
              badge_status={null}
            />
          </Col>
          <Col className="col-md-6">
            <div>
              <div>{userInfo.real_name}</div>
              <div className="small text-muted">
                slack id: {userInfo.name}
              </div>
            </div>
          </Col>
        </Row>);
    }
    return <Card>none</Card>;
  }

  public getOverTimeRows() {
    if (this.overloadStore === null) {
      return null;
    }

    return this.overloadStore.Records
    .sort((a, b) => a.week > b.week ? -1 : 1)
    .map((mv) => {
      const { week } = mv;
      const startDate = luxon.DateTime.fromISO(`${week}-1`).minus({ days: 1 });
      const endDate = luxon.DateTime.fromISO(`${week}-6`);
      const period = `${startDate.toFormat('yyyy-LL-dd')} ~ ${endDate.toFormat('yyyy-LL-dd')}`;
      // mv.over가 존재하면 luxon.Duration으로 뽑아낸다.
      // 그리고 toFormat('hh:mm:ss')로 표시
      // 위와 같은 작업을 remain에도 진행한다.
      const overTimeStr = !!mv.over ? luxon.Duration.fromObject(mv.over).toFormat('hh:mm:ss') : '-';
      return (
        <tr
          key={mv.week}
          onClick={() => { this.handleClickRow(mv.week); }}
          style={{cursor: 'pointer'}}
        >
          <td>
            {mv.week}
          </td>
          <td className="d-none d-sm-block">
            <div>{period}</div>
          </td>
          <td>
            {overTimeStr}
          </td>
        </tr>
      );
    });
  }

  public getFuseOverTimeRows() {
    if (this.overloadStore === null) {
      return null;
    }

    return this.overloadStore.FuseRecords
    .sort((a, b) => a.date > b.date ? -1 : 1)
    .map((mv) => {
      const { date, use } = mv;
      const useDate = luxon.DateTime.fromFormat(date, 'yyyyLLdd');
      const useDateStr = useDate.toFormat('yyyy-LL-dd');
      const duration = luxon.Duration.fromISO(use);
      const durationStr = duration.toFormat('hh:mm:ss');
      return (
        <tr
          key={mv.date}
        >
          <td>
            {useDateStr}
          </td>
          <td>
            {durationStr}
          </td>
        </tr>
      );
    });
  }

  public getRemainTimes() {
    if (this.overloadStore === null) {
      return '-';
    }
    const totalRemainDurationObj = this.overloadStore.totalRemain();
    if (totalRemainDurationObj === null) {
      return '-';
    }
    if (Object.keys(totalRemainDurationObj).length <= 0) {
      return 'a';
    }
    const duration = luxon.Duration.fromObject(totalRemainDurationObj);
    return duration.toFormat('hh:mm:ss');
  }

  public handleClickRow(week: string) {
    const startDate = luxon.DateTime.fromISO(`${week}-1`).minus({ days: 1 });
    const endDate = luxon.DateTime.fromISO(`${week}-6`);
    if (this.state.isServer === false && !!this.loginUserStore && !!this.loginUserStore.UserInfo) {
      const { id } = this.loginUserStore.UserInfo;
      const startDateStr = startDate.toFormat('yyyy-LL-dd');
      const endDateStr = endDate.toFormat('yyyy-LL-dd');
      window.location.href = `/records/${id}?startDate=${startDateStr}&endDate=${endDateStr}`;
    }
  }

  public async componentDidMount() {
    this.setState({
      ...this.state,
      isServer: false,
    });
    if (Auth.isLogined === true && !!Auth.loginUserKey && !!Auth.loginUserTokenKey) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
      await this.loginUserStore.findLoginUserInfo(Auth.loginUserTokenKey);
      await this.overloadStore.findAllOverload(Auth.loginUserKey);
      await this.overloadStore.findAllFuseOverload(Auth.loginUserKey);
    }
  }

  public render() {
    const avatar = this.getAvatar();
    const rows = this.getOverTimeRows();
    const fuseRows = this.getFuseOverTimeRows();
    const totalRemainTime = this.getRemainTimes();
    return (
      <div className="app">
        <Helmet>
          <title>Overload</title>
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
                {avatar}
              </CardHeader>
              <CardBody>
                차감 가능한 시간: {totalRemainTime}
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                누적된 초과 근무
              </CardHeader>
              <CardBody>
                <Table
                  responsive={true}
                  className="d-sm-table"
                  hover={true}
                >
                  <thead className="thead-light">
                    <tr>
                      <th>기록</th>
                      <th className="d-none d-sm-block">기록기간</th>
                      <th>초과시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                사용한 초과 근무
              </CardHeader>
              <CardBody>
                <Table
                  responsive={true}
                  className="d-sm-table"
                >
                  <thead className="thead-light">
                    <tr>
                      <th>사용일자</th>
                      <th>사용시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuseRows}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Container>
        </div>
      </div>
    );
  }
}

export default RecordOverloadContainer;