import '../../../styles/style.css';

import debug from 'debug';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import {
    Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Container, ListGroup, ListGroupItem
} from 'reactstrap';

import { Group } from '../../../models/group/Group';
import { GroupRequestBuilder } from '../../../models/group/GroupRequestBuilder';
import { IGroupInfo } from '../../../models/group/interface/IGroupInfo';
import { Auth } from '../../../services/auth';
import { RequestBuilderParams } from '../../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';
import GroupInfoStore from '../../../stores/GroupInfoStore';
import LoginStore from '../../../stores/LoginStore';
import DefaultHeader from '../../common/DefaultHeader';
import { IAfterRequestContext } from '../../interface/IAfterRequestContext';

export interface IGroupInfoContainerProps {
  groupInfos: IGroupInfo[];
}

const log = debug('trv:GroupInfoContainer');

@observer
export default class GroupInfoContainer extends React.Component<IGroupInfoContainerProps, {isServer: boolean}> {
  private gropInfostore: GroupInfoStore;
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
      groupInfos: actionResp.type === EN_REQUEST_RESULT.SUCCESS ? actionResp.data : [],
    };
  }

  constructor(props: IGroupInfoContainerProps) {
    super(props);

    this.state = {
      isServer: true,
    };

    this.handleClickGotoGroup = this.handleClickGotoGroup.bind(this);
    this.getRows = this.getRows.bind(this);
    this.isLogined = this.isLogined.bind(this);
    this.loginUserStore = new LoginStore(null);
    this.gropInfostore = new GroupInfoStore(this.props.groupInfos);
  }

  public handleClickGotoGroup(groupId: string) {
    window.location.href = `/groups/${groupId}`;
  }

  public getRows() {
    return this.props.groupInfos
    .map((mv) => {
      return (
        <ListGroupItem
          key={mv.group_id}
        >
          <span>
            {mv.desc}
          </span>
          <span className="list-group-button">
            <Button
              onClick={() => { this.handleClickGotoGroup(mv.group_id); }}
            >
              로그확인
            </Button>
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
      isServer: false,
    });
    if (Auth.isLogined === true && !!Auth.loginUserKey) {
      await this.loginUserStore.findUserInfo(Auth.loginUserKey);
    }
  }

  public render() {
    const rows = this.getRows();
    return (
      <div className="app">
        <Helmet>
          <title>Groups</title>
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
                그룹 목록
              </CardHeader>
              <CardBody>
                <ListGroup>
                  {rows}
                </ListGroup>
              </CardBody>
            </Card>
          </Container>
        </div>
      </div>
    );
  }
}