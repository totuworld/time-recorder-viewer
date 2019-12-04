import '@coreui/icons/css/coreui-icons.min.css';
import '../../../styles/style.css';

import * as debug from 'debug';
import { observer } from 'mobx-react';
import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Input,
  ListGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner
} from 'reactstrap';

import { Beverage } from '../../../models/beverage/Beverage';
import { BeverageRequestBuilder } from '../../../models/beverage/BeverageRequestBuilder';
import { IBeverage } from '../../../models/beverage/interface/IBeverage';
import { JSCFindAllBeverage } from '../../../models/beverage/JSONSchema/JSCFindAllBeverage';
import { Event } from '../../../models/event/Event';
import { EventRequestBuilder } from '../../../models/event/EventRequestBuilder';
import { IEvent } from '../../../models/event/interface/IEvent';
import {
  IEventOrder,
  TEventOrder
} from '../../../models/event/interface/IEventOrder';
import { JSCFindEvent } from '../../../models/event/JSONSchema/JSCFindEvent';
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
import EventDetailStore from '../../../stores/EventDetailStore';
import LoginStore from '../../../stores/LoginStore';
import DefaultHeader from '../../common/DefaultHeader';
import { IAfterRequestContext } from '../../interface/IAfterRequestContext';
import QueueFindItem from '../../queue/find/item';
import { Search } from '../add/search';
import BeverageFindItem from './beverageItem';
import OrderItem from './orderItem';

interface IState {
  isServer: boolean;
  isOpenAddBeverage: boolean;
  searchText: string;
  matchBeverages: IBeverage[];
  matchOrders: TEventOrder[];
  selectedBeverage?: IBeverage;
  option: string;
  toggleUserList: boolean;
}

interface IProp {
  info: IEvent | null;
  beverages: IBeverage[];
  orders: IEventOrder[];
  users: ISlackUserInfo[];
  guests: IUserInfo[];
}

const log = debug('trv:CoffeeDetailContainer');

@observer
export default class CoffeeDetailContainer extends React.Component<
  IProp,
  IState
> {
  private loginUserStore: LoginStore;
  private detailStore: EventDetailStore;

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

    const eventRb = new EventRequestBuilder(rbParam);
    const eventAction = new Event(eventRb);

    const beverageRb = new BeverageRequestBuilder(rbParam);
    const beverageAction = new Beverage(beverageRb);

    const userRb = new UserRequestBuilder(rbParam);
    const userAction = new User(userRb);

    const [
      eventInfo,
      beverages,
      orders,
      slackUserResp,
      guests
    ] = await Promise.all([
      eventAction.findEvent(
        { params: { event_id: match.params.event_id } },
        JSCFindEvent
      ),
      beverageAction.findAll(
        { query: { page: 1, limit: 90 } },
        JSCFindAllBeverage
      ),
      eventAction.orders(
        { params: { event_id: match.params.event_id } },
        JSCFindEvent
      ),
      userAction.findAllSlackUsers(),
      eventAction.findGuests(
        { params: { event_id: match.params.event_id } },
        JSCFindEvent
      )
    ]);

    const slackUserInfos =
      slackUserResp.type === EN_REQUEST_RESULT.ERROR ? [] : slackUserResp.data;

    const ret: IProp = {
      info:
        eventInfo.type === EN_REQUEST_RESULT.SUCCESS && !!eventInfo.data
          ? eventInfo.data
          : null,
      beverages:
        beverages.type === EN_REQUEST_RESULT.SUCCESS && !!beverages.data
          ? beverages.data
          : [],
      orders:
        orders.type === EN_REQUEST_RESULT.SUCCESS && !!orders.data
          ? orders.data
          : [],
      users: Util.isNotEmpty(slackUserInfos) ? slackUserInfos : [],
      guests:
        guests.type === EN_REQUEST_RESULT.SUCCESS && !!guests.data
          ? guests.data
          : []
    };

    return ret;
  }

  constructor(props: IProp) {
    super(props);

    this.state = {
      isServer: true,
      searchText: '',
      matchBeverages: [],
      matchOrders: [],
      isOpenAddBeverage: false,
      selectedBeverage: undefined,
      option: '',
      toggleUserList: false
    };

    this.isLogined = this.isLogined.bind(this);
    this.btnSpinner = this.btnSpinner.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onChangeAddBeverageOptionText = this.onChangeAddBeverageOptionText.bind(
      this
    );
    this.matchBeverages = this.matchBeverages.bind(this);
    this.removeSearchResult = this.removeSearchResult.bind(this);
    this.handleClickSearchedBeverage = this.handleClickSearchedBeverage.bind(
      this
    );
    this.handleClickSearchedOrder = this.handleClickSearchedOrder.bind(this);
    this.closeAddBeverageModal = this.closeAddBeverageModal.bind(this);
    this.addBeverageModal = this.addBeverageModal.bind(this);
    this.handleClickMyItem = this.handleClickMyItem.bind(this);
    this.orderItems = this.orderItems.bind(this);
    this.isClosed = this.isClosed.bind(this);
    this.getOwnerMenu = this.getOwnerMenu.bind(this);
    this.toggleGuestList = this.toggleGuestList.bind(this);
    this.getGuestsItem = this.getGuestsItem.bind(this);
    this.addBeverage = this.addBeverage.bind(this);
    this.loginUserStore = new LoginStore(null);
    const initValue = {
      eventInfo: !!this.props.info ? this.props.info : undefined,
      users: props.guests,
      beverages: props.beverages,
      orders: this.props.orders,
      totalUsers: this.props.users
    };
    this.detailStore = new EventDetailStore(initValue);
  }

  private isLogined() {
    if (this.state.isServer === true) {
      return false;
    }
    return this.loginUserStore.isLogin;
  }

  private btnSpinner() {
    const btnSpinner = Util.isNotEmpty(this.detailStore) ? (
      this.detailStore.LoadingState ? (
        <Spinner />
      ) : null
    ) : null;
    return btnSpinner;
  }

  private onChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const searchValue = e.currentTarget.value.trim();
    const updateState = { ...this.state };
    updateState.searchText = searchValue;
    if (Util.isNotEmpty(this.detailStore) && searchValue.length > 0) {
      updateState.matchBeverages = [
        ...this.detailStore.Beverages.values()
      ].filter(fv => {
        if (fv.title.indexOf(searchValue) >= 0) {
          return true;
        }
        if (!!fv.alias && fv.alias.indexOf(searchValue) >= 0) {
          return true;
        }
        return false;
      });
    }
    if (
      Util.isNotEmpty(this.detailStore) &&
      Util.isNotEmpty(this.detailStore.Orders) &&
      searchValue.length > 0
    ) {
      const valueList = [...this.detailStore.Orders.values()];
      const orderList = valueList.map(mv => mv[0]);
      const searchedList = orderList.filter(fv => {
        return fv.title.indexOf(searchValue) >= 0;
      });
      updateState.matchOrders = searchedList;
    }
    if (searchValue.length <= 0) {
      updateState.matchBeverages = [];
      updateState.matchOrders = [];
    }
    this.setState(updateState);
  }

  private onChangeAddBeverageOptionText(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const optionValue = e.currentTarget.value.trim();
    const updateState = { ...this.state };
    updateState.option = optionValue;
    this.setState(updateState);
  }

  private matchBeverages() {
    if (Util.isEmpty(this.detailStore)) {
      return null;
    }
    const orders = this.state.matchOrders.map(mv => {
      const findOrders = this.detailStore.Orders.get(`${mv.id},${mv.option}`);
      const count = Util.isNotEmpty(findOrders) ? findOrders.length : undefined;
      return (
        <BeverageFindItem
          key={`${mv.id}_${mv.guest_id}`}
          {...mv}
          count={count}
          handleOnClick={() => {
            this.handleClickSearchedOrder(mv);
          }}
        />
      );
    });
    const beverages = this.state.matchBeverages.map(mv => {
      return (
        <BeverageFindItem
          key={mv.id}
          {...mv}
          handleOnClick={() => {
            this.handleClickSearchedBeverage(mv);
          }}
        />
      );
    });
    const orderAndBeverage = [...orders, ...beverages];
    if (orderAndBeverage.length <= 0 && this.state.searchText.length >= 2) {
      return '검색된 음료나 주문이 없습니다.';
    }
    return orderAndBeverage;
  }

  private removeSearchResult() {
    // 검색 결과 초기화 시킨다.
    const updateState = { ...this.state };
    updateState.searchText = '';
    updateState.selectedBeverage = undefined;
    updateState.isOpenAddBeverage = false;
    updateState.matchBeverages = [];
    updateState.matchOrders = [];
    updateState.option = '';
    this.setState(updateState);
  }

  private handleClickSearchedBeverage(beverage: IBeverage) {
    const updateState = { ...this.state };
    updateState.selectedBeverage = beverage;
    updateState.isOpenAddBeverage = true;
    this.setState(updateState);
  }

  private async handleClickSearchedOrder(order: TEventOrder) {
    // 내가 이미 주문한 사항인가?
    if (
      this.isLogined() === false ||
      Util.isEmpty(this.loginUserStore.UserInfo) ||
      Util.isEmpty(this.detailStore.Orders)
    ) {
      return;
    }
    const orderList = this.detailStore.Orders.get(
      `${order.beverage_id},${order.option}`
    );
    if (Util.isNotEmpty(orderList)) {
      const isMyOrder =
        orderList.findIndex(
          fv => fv.guest_id === this.loginUserStore.UserInfo!.id
        ) >= 0;
      if (isMyOrder) {
        return;
      }
    }
    // 주문 등록 가즈아.
    await this.detailStore.addOrder(
      this.loginUserStore.UserInfo!.id,
      { title: order.title, id: order.beverage_id, alias: order.alias },
      !!order.option ? order.option : ''
    );
    this.removeSearchResult();
  }

  private closeAddBeverageModal() {
    const updateState = { ...this.state };
    updateState.isOpenAddBeverage = false;
    this.setState(updateState);
  }

  private addBeverageModal() {
    if (
      !!this.state.selectedBeverage === false ||
      this.state.selectedBeverage === undefined
    ) {
      return null;
    }
    const beverage = this.state.selectedBeverage;
    const btnSpinner = this.btnSpinner();
    return (
      <>
        <ModalHeader>{beverage.title}</ModalHeader>
        <ModalBody>
          <Input
            type="text"
            onChange={this.onChangeAddBeverageOptionText}
            placeholder="원하는 옵션 입력"
          />
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={async () => {
              await this.detailStore.addOrder(
                this.loginUserStore.UserInfo!.id,
                beverage,
                this.state.option
              );
              this.removeSearchResult();
            }}
            color="success"
          >
            {btnSpinner}
            주문 추가
          </Button>
          <Button onClick={this.closeAddBeverageModal}>닫기</Button>
        </ModalFooter>
      </>
    );
  }

  private async handleClickMyItem() {
    if (
      !!this.detailStore &&
      this.isLogined() === true &&
      !!this.loginUserStore.UserInfo
    ) {
      await this.detailStore.deleteOrder(this.loginUserStore.UserInfo.id);
    }
  }

  private orderItems() {
    if (
      !!this.detailStore &&
      this.detailStore.Orders.size > 0 &&
      this.props.users.length > 0
    ) {
      const returnElements: Array<React.ReactElement<any>> = [];
      this.detailStore.Orders.forEach((orders, key) => {
        const userIds = orders.map(mv => mv.guest_id);
        const isMine =
          this.isLogined() === true &&
          !!this.loginUserStore.UserInfo &&
          userIds.findIndex(fvi => {
            return fvi === this.loginUserStore.UserInfo!.id;
          }) >= 0;
        const filterUsers: ISlackUserInfo[] = userIds
          .map(userId => {
            const find = this.detailStore.AllUsers.get(userId);
            return find;
          })
          .filter(fv => {
            const returnValue = Util.isNotEmpty<ISlackUserInfo>(fv);
            return returnValue;
          }) as ISlackUserInfo[];
        if (filterUsers.length > 0) {
          returnElements.push(
            <OrderItem
              key={key}
              title={orders[0].title}
              option={orders[0].option}
              count={orders.length}
              beverage_id={orders[0].beverage_id}
              users={filterUsers}
              isMine={isMine}
              handleOnClick={
                isMine === true
                  ? this.handleClickMyItem
                  : () => {
                      console.log('');
                    }
              }
            />
          );
        }
      });
      if (returnElements.length > 0) {
        return returnElements;
      }
    }
    return null;
  }
  private isClosed() {
    if (Util.isNotEmpty(this.detailStore)) {
      return this.detailStore.Info.closed;
    }
    if (Util.isNotEmpty(this.props.info)) {
      return this.props.info.closed;
    }
    return true;
  }

  private getOwnerMenu() {
    // 비로그인, 혹은 로그인 정보 미취득 시 아무것도 없음
    if (
      this.isLogined() === false ||
      Util.isEmpty(this.loginUserStore) ||
      Util.isEmpty(this.loginUserStore.UserInfo) ||
      Util.isEmpty(this.detailStore) ||
      Util.isEmpty(this.detailStore.Info)
    ) {
      return null;
    }
    const isClosed = this.isClosed();
    if (
      isClosed === false &&
      Util.isNotEmpty(this.props.info) &&
      Util.isNotEmpty(this.loginUserStore.UserInfo) &&
      this.props.info.owner_id === this.loginUserStore.UserInfo.id
    ) {
      return [
        <Button
          key="holo"
          onClick={async () => {
            await this.detailStore.sendMsgToGuests();
          }}
        >
          참가자에게 주문 요청하기
        </Button>,
        <Button
          key="close_btn"
          color="danger"
          onClick={async () => {
            if (confirm('주문을 마감하시겠습니까?')) {
              await this.detailStore.closeEvent();
            }
          }}
        >
          주문 마감
        </Button>
      ];
    }
    return null;
  }

  private toggleGuestList() {
    const updateState = { ...this.state };
    updateState.toggleUserList = !updateState.toggleUserList;
    this.setState(updateState);
  }

  private getGuestsItem() {
    if (
      Util.isNotEmpty(this.detailStore) &&
      Util.isNotEmpty(this.detailStore.Users)
    ) {
      const userResult = [...this.detailStore.Users.values()].map(mv => {
        return (
          <QueueFindItem
            key={mv.id}
            {...mv}
            handleOnClick={() => {
              console.log(mv.id);
            }}
          />
        );
      });
      return userResult;
    }
    return null;
  }

  private async addBeverage() {
    const result = await this.detailStore.addBeverage(this.state.searchText);
    if (result) {
      const updateState = { ...this.state };
      updateState.matchBeverages.push(result);
      this.setState(updateState);
    }
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
    const btnSpinner = this.btnSpinner();
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
    const isPrivate = !!this.detailStore.Info.private;
    const searchedBeverages = this.matchBeverages();
    const addBeverageModalBody = this.addBeverageModal();
    const myOrder = (() => {
      if (
        !!this.detailStore.Orders &&
        this.isLogined() === true &&
        !!this.loginUserStore.UserInfo
      ) {
        const myOwnOrder = this.detailStore.getMyOrder(
          this.loginUserStore.UserInfo.id
        );
        if (myOwnOrder === null) {
          return null;
        }
        return (
          <Card>
            <CardHeader>
              <h4>🙋내 ☕️주문</h4>
            </CardHeader>
            <CardBody>
              <p>{myOwnOrder.title}</p>
              <p>옵션({myOwnOrder.option})</p>
            </CardBody>
          </Card>
        );
      }
      return null;
    })();
    const orders = this.orderItems();
    const ownerMenu = this.getOwnerMenu();
    const guestItems = this.getGuestsItem();
    const addBeverage =
      this.state.searchText.length > 1 &&
      this.state.matchBeverages.length === 0 &&
      this.state.matchOrders.length === 0 ? (
        <Button
          onClick={async () => {
            await this.addBeverage();
          }}
        >
          {btnSpinner}
          음료 추가
        </Button>
      ) : null;
    const totalOrderCount =
      !!this.detailStore && !!this.detailStore.Orders
        ? this.detailStore.totalOrders()
        : this.props.orders.length;
    const loginBtn = this.isLogined() ? null : (
      <Button href={`/login?redirect_uri=/coffeebreak/${this.props.info!.id}`}>
        로그인
      </Button>
    );
    const guestCountBadge =
      guestItems === null ? null : <Badge> 총 {guestItems.length} 명 </Badge>;

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
                <h3>
                  <Badge color={isPrivate ? 'warning' : 'primary'}>
                    {isPrivate ? '비공개' : '공개'}
                  </Badge>{' '}
                  {disTitle}
                </h3>
                <p>{disDesc}</p>
                {ownerMenu}
              </CardHeader>
              {loginBtn}
              <Search
                title=""
                showTitle={false}
                placeHolder={
                  !this.isLogined()
                    ? '음료 주문은 로그인한 사용자만 가능합니다'
                    : '음료 검색 ex) ㅇㅇ'
                }
                onChangeInput={this.onChangeInput}
                handleSubmit={() => {
                  console.log(this.state.searchText);
                }}
                disabled={this.isClosed() || !this.isLogined()}
              >
                {addBeverage}
                <ListGroup>{searchedBeverages}</ListGroup>
              </Search>
            </Card>
            {myOrder}
            <Card>
              <CardHeader>
                주문 목록 <Badge>합계 {totalOrderCount} 잔</Badge>
              </CardHeader>
              <CardBody>{orders}</CardBody>
            </Card>
            <Card>
              <CardHeader>
                참가자 목록 {guestCountBadge}{' '}
                <Button
                  outline={true}
                  size="sm"
                  onClick={() => {
                    this.toggleGuestList();
                  }}
                >
                  {this.state.toggleUserList ? '닫기' : '열기'}
                </Button>
              </CardHeader>
              <CardBody>
                {this.state.toggleUserList === true ? guestItems : null}
              </CardBody>
            </Card>
          </Container>
          <Modal isOpen={this.state.isOpenAddBeverage}>
            {addBeverageModalBody}
          </Modal>
        </div>
      </div>
    );
  }
}
