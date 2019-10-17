import '@coreui/icons/css/coreui-icons.min.css';
import '../../../styles/style.css';

import debug from 'debug';
import { produce } from 'immer';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container
} from 'reactstrap';

import { Group } from '../../../models/group/Group';
import { GroupRequestBuilder } from '../../../models/group/GroupRequestBuilder';
import { IGroupInfo } from '../../../models/group/interface/IGroupInfo';
import {
  ISlackUserInfo,
  IUserInfo
} from '../../../models/user/interface/IUserInfo';
import { User } from '../../../models/user/User';
import { UserRequestBuilder } from '../../../models/user/UserRequestBuilder';
import { Auth } from '../../../services/auth';
import { RequestBuilderParams } from '../../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../../services/util';
import EventAddStore from '../../../stores/EventAddStore';
import LoginStore from '../../../stores/LoginStore';
import DefaultHeader from '../../common/DefaultHeader';
import { IAfterRequestContext } from '../../interface/IAfterRequestContext';
import QueueFindItem from '../../queue/find/item';
import { CreateEventItem } from './create_event_item';
import GroupFindItem from './group_item';
import { Search } from './search';

interface IState {
  isServer: boolean;
  step: number;
  firstData: FormValues;
  searchText: string;
  matchUsers: ISlackUserInfo[];
  matchGroups: IGroupInfo[];
  selectedUsers: IUserInfo[];
}

interface IProp {
  slackUserInfos: ISlackUserInfo[];
  groupInfos: IGroupInfo[];
}

interface FormValues {
  title: string;
  desc: string;
  private: boolean;
}

const log = debug('trv:CoffeeAddContainer');

@observer
export default class CoffeeAddContainer extends React.Component<IProp, IState> {
  private loginUserStore: LoginStore;
  private eventAddStore: EventAddStore;

  public static async getInitialProps({
    req,
    match
  }: IAfterRequestContext<{ user_id: string }>) {
    log(match.params.user_id);
    log(!!req && !!req.config);
    let rbParam: RequestBuilderParams = { isProxy: true };
    if (!!req && !!req.config) {
      rbParam = { baseURI: req.config.getApiURI(), isProxy: false };
    }

    const groupRb = new GroupRequestBuilder(rbParam);
    const groupAction = new Group(groupRb);

    const userRb = new UserRequestBuilder(rbParam);
    const userAction = new User(userRb);

    const [slackUserResp, groups] = await Promise.all([
      userAction.findAllSlackUsers(),
      groupAction.findAllGroupInfos()
    ]);

    const slackUserInfos =
      slackUserResp.type === EN_REQUEST_RESULT.ERROR ? [] : slackUserResp.data;

    const ret: IProp = {
      slackUserInfos: Util.isNotEmpty(slackUserInfos) ? slackUserInfos : [],
      groupInfos: groups.type === EN_REQUEST_RESULT.SUCCESS ? groups.data : []
    };

    return ret;
  }

  constructor(props: IProp) {
    super(props);

    this.state = {
      isServer: true,
      step: 1,
      searchText: '',
      matchUsers: [],
      matchGroups: [],
      firstData: {
        title: '',
        desc: '',
        private: false
      },
      selectedUsers: []
    };

    this.isLogined = this.isLogined.bind(this);
    this.setStepOneData = this.setStepOneData.bind(this);
    this.removeSearchText = this.removeSearchText.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.getMatchItems = this.getMatchItems.bind(this);
    this.loginUserStore = new LoginStore(null);
    this.eventAddStore = new EventAddStore({ users: [] });
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

  private removeSearchText() {
    const updateState = produce(this.state, draft => {
      draft.searchText = '';
      draft.matchGroups = [];
      draft.matchUsers = [];
    });
    this.setState(updateState);
  }

  private onChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const updateState = produce(this.state, draft => {
      const searchValue = e.currentTarget.value;
      draft.searchText = searchValue;
      if (
        Util.isNotEmpty(this.props.slackUserInfos) &&
        searchValue.length > 0
      ) {
        draft.matchUsers = this.props.slackUserInfos
          .filter(
            fv =>
              fv.real_name.includes(searchValue) ||
              fv.name.includes(searchValue)
          )
          .filter((_, idx) => idx <= 5);
      }
      if (Util.isNotEmpty(this.props.groupInfos) && searchValue.length > 0) {
        draft.matchGroups = this.props.groupInfos
          .filter(
            fv => fv.name.includes(searchValue) || fv.desc.includes(searchValue)
          )
          .filter((_, idx) => idx <= 5);
      }
      if (searchValue.length <= 0) {
        draft.matchUsers = [];
        draft.matchGroups = [];
      }
    });
    this.setState(updateState);
  }

  private getMatchItems() {
    if (
      Util.isEmpty(this.state.matchUsers) &&
      Util.isEmpty(this.state.matchGroups)
    ) {
      return null;
    }
    const groupResult = this.state.matchGroups.map(mv => {
      return (
        <GroupFindItem
          key={mv.group_id}
          {...mv}
          handleOnClick={() => {
            this.eventAddStore.findAndAddGroupUsers(mv.group_id);
            this.removeSearchText();
          }}
        />
      );
    });
    const userResult = this.state.matchUsers.map(mv => {
      return (
        <QueueFindItem
          key={mv.id}
          {...mv}
          handleOnClick={() => {
            const copyMv = { ...mv };
            this.eventAddStore.addUsers([copyMv]);
            this.removeSearchText();
          }}
        />
      );
    });
    return [...groupResult, ...userResult];
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
    const items = this.getMatchItems();
    const cardBodyElement =
      this.state.step === 1 ? (
        <CreateEventItem handleSubmit={this.setStepOneData} />
      ) : (
        <>
          <Button
            onClick={async () => {
              if (!!this.loginUserStore.UserInfo) {
                const result = await this.eventAddStore.createEvent({
                  ...this.state.firstData,
                  owner: this.loginUserStore.UserInfo
                });
                if (result !== null) {
                  window.location.href = `/coffeebreak/${result}`;
                }
              }
            }}
          >
            완료
          </Button>
          <Search
            title={this.state.firstData.title}
            showTitle={true}
            placeHolder="검색어 입력 ex) 야놀자"
            onChangeInput={this.onChangeInput}
            handleSubmit={() => {
              console.log(this.state.searchText);
            }}
          />
          {items}
        </>
      );
    const userList: Array<React.ReactElement<QueueFindItem>> = [];
    this.eventAddStore.Users.forEach((user, id) => {
      userList.push(
        <QueueFindItem
          key={id}
          {...user}
          handleOnClick={() => {
            this.eventAddStore.removeUsers(user);
          }}
        />
      );
    });
    return (
      <div className="app">
        <Helmet>
          <title>☕️⏱</title>
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
                <h3>새로운 ️️☕️⏱</h3>
              </CardHeader>
              {cardBodyElement}
            </Card>
            {this.state.step !== 2 ? null : (
              <Card>
                <CardHeader>
                  참가자 목록 <Badge>총 {userList.length} 명</Badge>
                </CardHeader>
                <CardBody>{userList}</CardBody>
              </Card>
            )}
          </Container>
        </div>
      </div>
    );
  }
}
