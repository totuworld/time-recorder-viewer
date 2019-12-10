import '../../../styles/style.css';

import debug from 'debug';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Input,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'reactstrap';

import { Group } from '../../../models/group/Group';
import { GroupRequestBuilder } from '../../../models/group/GroupRequestBuilder';
import { IGroupInfo } from '../../../models/group/interface/IGroupInfo';
import { Auth } from '../../../services/auth';
import { RequestBuilderParams } from '../../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';
import FuseToVacationStore from '../../../stores/FuseToVacationStore';
import GroupInfoStore from '../../../stores/GroupInfoStore';
import LoginStore from '../../../stores/LoginStore';
import DefaultHeader from '../../common/DefaultHeader';
import { IAfterRequestContext } from '../../interface/IAfterRequestContext';

export interface IGroupInfoContainerProps {
  groupInfos: IGroupInfo[];
}

interface IState {
  isServer: boolean;
  isModalOpen: boolean;
  isConvertModalOpen: boolean;
  /** 만료 시킬 팀 */
  expireGroupId: string;
  /** 만료 사유 */
  expireDesc: string;
  /** 만료 기준 일짜(ex: 2020-03-31 을 입력하면 그 날짜 이하로 사용하지 않은 휴가 금고가 모두 만료됨) */
  expireFromDate: string;
}

const log = debug('trv:GroupInfoContainer');

@observer
export default class GroupInfoContainer extends React.Component<
  IGroupInfoContainerProps,
  IState
> {
  private gropInfostore: GroupInfoStore;
  private fuseToVacationStore: FuseToVacationStore;
  private loginUserStore: LoginStore;
  public static async getInitialProps({
    req,
    res,
    match
  }: IAfterRequestContext<{}>) {
    log(!!req && !!req.config);
    let rbParam: RequestBuilderParams = { isProxy: true };
    if (!!req && !!req.config) {
      rbParam = { baseURI: req.config.getApiURI(), isProxy: false };
    }

    const rb = new GroupRequestBuilder(rbParam);
    const action = new Group(rb);

    const actionResp = await action.findAllGroupInfos();
    log('actionResp.type: ', actionResp.type);
    if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
      log('actionResp.type: ', actionResp.type);
    }

    return {
      groupInfos:
        actionResp.type === EN_REQUEST_RESULT.SUCCESS ? actionResp.data : []
    };
  }

  constructor(props: IGroupInfoContainerProps) {
    super(props);

    this.state = {
      isServer: true,
      isModalOpen: false,
      isConvertModalOpen: false,
      expireGroupId: '',
      expireDesc: '',
      expireFromDate: ''
    };

    this.handleClickGotoGroup = this.handleClickGotoGroup.bind(this);
    this.getRows = this.getRows.bind(this);
    this.isLogined = this.isLogined.bind(this);
    this.loginUserStore = new LoginStore(null);
    this.gropInfostore = new GroupInfoStore(this.props.groupInfos);
    this.fuseToVacationStore = new FuseToVacationStore([]);
  }

  public handleClickGotoGroup(groupId: string) {
    window.location.href = `/groups/${groupId}`;
  }

  public getRows() {
    const haveAuth =
      this.state.isServer === false &&
      !!Auth.loginUserTokenKey &&
      !!this.loginUserStore.LoginUserInfo &&
      !!this.loginUserStore.LoginUserInfo.auth &&
      this.loginUserStore.LoginUserInfo.auth === 10;
    return this.props.groupInfos.map(mv => {
      return (
        <ListGroupItem key={mv.group_id}>
          <span>{mv.desc}</span>
          <span className="list-group-buttons">
            <span>
              <Button
                onClick={() => {
                  this.handleClickGotoGroup(mv.group_id);
                }}
              >
                로그확인
              </Button>
            </span>
            {haveAuth ? (
              <span>
                <Button
                  onClick={() => {
                    this.setState({
                      ...this.state,
                      isModalOpen: true,
                      expireGroupId: mv.group_id
                    });
                  }}
                >
                  휴가금고 정리
                </Button>
              </span>
            ) : null}
            {haveAuth ? (
              <span>
                <Button
                  onClick={() => {
                    this.setState({
                      ...this.state,
                      isConvertModalOpen: true,
                      expireGroupId: mv.group_id
                    });
                  }}
                >
                  초과근무 전환
                </Button>
              </span>
            ) : null}
          </span>
        </ListGroupItem>
      );
    });
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
    if (Auth.isLogined === true && !!Auth.loginUserTokenKey) {
      await this.loginUserStore.findLoginUserInfo(Auth.loginUserTokenKey);
    }
  }

  public render() {
    const rows = this.getRows();
    const expireFromDateCheckInvalid =
      /^\d{4}-\d{2}-\d{2}$/.test(this.state.expireFromDate) === false;
    const expireDescCheckInvalid = this.state.expireDesc.length <= 1;
    return (
      <div className="app">
        <Helmet>
          <title>Groups</title>
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
                <h2>그룹 목록</h2>
              </CardHeader>
              <CardBody>
                <ListGroup>{rows}</ListGroup>
              </CardBody>
            </Card>
          </Container>
          <Modal isOpen={this.state.isModalOpen}>
            <ModalHeader>{`${this.state.expireGroupId} | 휴가금고 정리`}</ModalHeader>
            <ModalBody>
              <Input
                placeholder="마감 기준일(ex: 2020-03-31)"
                value={this.state.expireFromDate}
                invalid={expireFromDateCheckInvalid}
                onChange={e => {
                  const currentValue = e.currentTarget.value;
                  this.setState({
                    ...this.state,
                    expireFromDate: currentValue
                  });
                }}
              />
              <Input
                placeholder="마감 사유(ex: 2020 1Q 휴가금고 마감)"
                value={this.state.expireDesc}
                invalid={expireDescCheckInvalid}
                onChange={e => {
                  const currentValue = e.currentTarget.value;
                  this.setState({
                    ...this.state,
                    expireDesc: currentValue
                  });
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                disabled={
                  expireDescCheckInvalid === true ||
                  expireFromDateCheckInvalid === true
                }
                color="primary"
                onClick={async () => {
                  const auth_id = this.loginUserStore.LoginUserInfo
                    ? this.loginUserStore.LoginUserInfo.id
                    : null;
                  if (auth_id === null) {
                    return;
                  }
                  const req = {
                    auth_id,
                    expireDesc: this.state.expireDesc,
                    expireDate: this.state.expireFromDate,
                    groupID: this.state.expireGroupId
                  };
                  if (
                    confirm(
                      `마감 : 요청 사항을 확인해주세요\n${JSON.stringify({
                        req
                      })}`
                    )
                  ) {
                    const resp = await this.fuseToVacationStore.disableExpiredFuseToVacation(
                      req
                    );
                    alert(
                      `휴가금고 만료 처리 상태: ${
                        resp ? '완료' : '오류 발생\n잠시후 재시도 해보세요'
                      }`
                    );
                    if (resp === true) {
                      this.setState({
                        ...this.state,
                        isModalOpen: false
                      });
                    }
                  }
                }}
              >
                적용
              </Button>
              <Button
                onClick={() => {
                  this.setState({
                    ...this.state,
                    isModalOpen: false
                  });
                }}
              >
                닫기
              </Button>
            </ModalFooter>
          </Modal>
          <Modal isOpen={this.state.isConvertModalOpen}>
            <ModalHeader>{`${this.state.expireGroupId} | 초과근무 -> 휴가금고`}</ModalHeader>
            <ModalBody>
              <Input
                placeholder="마감일(ex: 2020-03-31)"
                value={this.state.expireFromDate}
                invalid={expireFromDateCheckInvalid}
                onChange={e => {
                  const currentValue = e.currentTarget.value;
                  this.setState({
                    ...this.state,
                    expireFromDate: currentValue
                  });
                }}
              />
              <Input
                placeholder="생성 사유(ex: 2020 1Q 마감)"
                value={this.state.expireDesc}
                invalid={expireDescCheckInvalid}
                onChange={e => {
                  const currentValue = e.currentTarget.value;
                  this.setState({
                    ...this.state,
                    expireDesc: currentValue
                  });
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                disabled={
                  expireDescCheckInvalid === true ||
                  expireFromDateCheckInvalid === true
                }
                color="primary"
                onClick={async () => {
                  const auth_id = this.loginUserStore.LoginUserInfo
                    ? this.loginUserStore.LoginUserInfo.id
                    : null;
                  if (auth_id === null) {
                    return;
                  }
                  const req = {
                    auth_id,
                    note: this.state.expireDesc,
                    expireDate: this.state.expireFromDate,
                    groupID: this.state.expireGroupId
                  };
                  if (
                    confirm(
                      `생성 : 요청 사항을 확인해주세요\n${JSON.stringify({
                        req
                      })}`
                    )
                  ) {
                    const resp = await this.fuseToVacationStore.convertFuseToVacation(
                      req
                    );
                    alert(
                      `생성 처리 상태: ${
                        resp ? '완료' : '오류 발생\n잠시후 재시도 해보세요'
                      }`
                    );
                    if (resp === true) {
                      this.setState({
                        ...this.state,
                        isConvertModalOpen: false
                      });
                    }
                  }
                }}
              >
                생성
              </Button>
              <Button
                onClick={() => {
                  this.setState({
                    ...this.state,
                    isConvertModalOpen: false
                  });
                }}
              >
                닫기
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    );
  }
}
