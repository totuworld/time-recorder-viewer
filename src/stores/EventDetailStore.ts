import { action, observable, runInAction } from 'mobx';

import { Beverage } from '../models/beverage/Beverage';
import { BeverageRequestBuilder } from '../models/beverage/BeverageRequestBuilder';
import { IBeverage } from '../models/beverage/interface/IBeverage';
import { JSCAddBeverage } from '../models/beverage/JSONSchema/JSCAddBeverage';
import { Event } from '../models/event/Event';
import { EventRequestBuilder } from '../models/event/EventRequestBuilder';
import { IEvent } from '../models/event/interface/IEvent';
import {
  IEventOrder,
  TEventOrder
} from '../models/event/interface/IEventOrder';
import { JSCAddOrder } from '../models/event/JSONSchema/JSCAddOrder';
import { JSCFindEvent } from '../models/event/JSONSchema/JSCFindEvent';
import { JSCRemoveOrder } from '../models/event/JSONSchema/JSCRemoveOrder';
import { JSCSendMsgToGuests } from '../models/event/JSONSchema/JSCSendMsgToGuests';
import { ISlackUserInfo, IUserInfo } from '../models/user/interface/IUserInfo';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';
import { Util } from '../services/util';

export default class EventDetailStore {
  @observable private isLoading: boolean = false;
  @observable private eventInfo: IEvent = {
    id: '?',
    title: '?',
    owner_id: '?',
    owner_name: '?',
    private: false,
    desc: '?',
    closed: true
  };
  @observable private targetUsers: Map<string, IUserInfo> = new Map();
  @observable private beverages: Map<string, IBeverage> = new Map();
  @observable private orders: Map<string, TEventOrder[]> = new Map();
  @observable private originalOrders: IEventOrder[] = [];
  @observable private totalUsers: Map<string, ISlackUserInfo> = new Map();

  constructor({
    eventInfo,
    users,
    beverages,
    orders,
    totalUsers
  }: {
    eventInfo?: IEvent;
    users: IUserInfo[];
    beverages: IBeverage[];
    orders: IEventOrder[];
    totalUsers: ISlackUserInfo[];
  }) {
    if (users.length > 0) {
      users.forEach(user => {
        this.targetUsers.set(user.id, user);
      });
    }
    if (totalUsers.length > 0) {
      totalUsers.forEach(user => {
        this.totalUsers.set(user.id, user);
      });
    }
    if (beverages.length > 0) {
      beverages.forEach(beverage => {
        this.beverages.set(beverage.id, beverage);
      });
    }
    if (orders.length > 0 && beverages.length > 0) {
      const reduceOrders = this.reduceOrder(orders);
      this.originalOrders = orders;
      this.orders = reduceOrders;
    }
    if (!!eventInfo) {
      this.eventInfo = eventInfo;
    }
  }

  /** 모든 사용자 목록 */
  get AllUsers() {
    return this.totalUsers;
  }

  /** 모든 음료 목록 */
  get Beverages() {
    return this.beverages;
  }

  /** 참가자 목록 */
  get Users() {
    return this.targetUsers;
  }

  /** 이벤트 정보 */
  get Info() {
    return this.eventInfo;
  }

  /** 주문 목록 */
  get Orders(): Map<string, TEventOrder[]> {
    return this.orders;
  }

  /** 로딩 여부 */
  get LoadingState() {
    return this.isLoading;
  }

  public totalOrders() {
    if (this.orders.size <= 0) {
      return 0;
    }
    let count = 0;
    this.orders.forEach(v => {
      count += v.length;
    });
    return count;
  }

  public getMyOrder(userId: string) {
    if (this.originalOrders.length <= 0) {
      return null;
    }
    const findSingleOrder = this.originalOrders.find(
      fv => fv.guest_id === userId
    );
    if (findSingleOrder === undefined) {
      return null;
    }
    const beverage = this.beverages.get(findSingleOrder.beverage_id);
    return {
      ...findSingleOrder,
      title: beverage === undefined ? '' : beverage.title
    };
  }

  private reduceOrder(orders: IEventOrder[]) {
    return orders.reduce((acc, cur) => {
      const key = `${cur.beverage_id},${cur.option}`;
      const beverage = this.beverages.get(cur.beverage_id);
      if (acc.has(key)) {
        const findValue = acc.get(key);
        const updateValue = Util.isNotEmpty(findValue) ? [...findValue] : [];
        if (!!beverage) {
          const addValue: TEventOrder = {
            ...cur,
            ...beverage
          };
          updateValue.push(addValue);
          acc.set(key, updateValue);
        }
      } else {
        if (!!beverage) {
          const addValue: TEventOrder = {
            ...cur,
            ...beverage
          };
          acc.set(key, [addValue]);
        }
      }
      return acc;
    }, new Map<string, TEventOrder[]>());
  }

  @action
  public async addOrder(userId: string, beverage: IBeverage, option: string) {
    if (this.isLoading === true) {
      return null;
    }
    try {
      this.isLoading = true;

      const eventRb = new EventRequestBuilder({ isProxy: true });
      const eventAction = new Event(eventRb);

      await eventAction.addOrder(
        {
          params: {
            eventId: this.eventInfo.id
          },
          body: {
            order: {
              beverage_id: beverage.id,
              guest_id: userId,
              option
            }
          }
        },
        JSCAddOrder
      );
      // orders 재로딩
      const orders = await eventAction.orders(
        { params: { event_id: this.eventInfo.id } },
        JSCFindEvent
      );
      return runInAction(() => {
        if (orders.type === EN_REQUEST_RESULT.SUCCESS && !!orders.data) {
          const reduceOrders = this.reduceOrder(orders.data);
          this.originalOrders = orders.data;
          this.orders = reduceOrders;
          alert(`주문완료\n${beverage.title} (${option})`);
        }
        this.isLoading = false;
        return null;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async deleteOrder(userId: string) {
    if (this.isLoading === true) {
      return null;
    }
    try {
      this.isLoading = true;

      const eventRb = new EventRequestBuilder({ isProxy: true });
      const eventAction = new Event(eventRb);

      await eventAction.deleteOrder(
        {
          params: {
            eventId: this.eventInfo.id,
            guestId: userId
          }
        },
        JSCRemoveOrder
      );
      // orders 재로딩
      const orders = await eventAction.orders(
        { params: { event_id: this.eventInfo.id } },
        JSCFindEvent
      );
      return runInAction(() => {
        if (orders.type === EN_REQUEST_RESULT.SUCCESS && !!orders.data) {
          const reduceOrders = this.reduceOrder(orders.data);
          this.originalOrders = orders.data;
          this.orders = reduceOrders;
        }
        this.isLoading = false;
        return null;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async sendMsgToGuests() {
    if (this.isLoading === true) {
      return null;
    }
    try {
      this.isLoading = true;

      const eventRb = new EventRequestBuilder({ isProxy: true });
      const eventAction = new Event(eventRb);

      await eventAction.sendMsgToGuests(
        {
          params: {
            eventId: this.eventInfo.id
          },
          query: {
            text: '☕️ 타임!'
          }
        },
        JSCSendMsgToGuests
      );
      return runInAction(() => {
        this.isLoading = false;
        return null;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async closeEvent() {
    if (this.isLoading === true) {
      return null;
    }
    try {
      this.isLoading = true;

      const eventRb = new EventRequestBuilder({ isProxy: true });
      const eventAction = new Event(eventRb);

      const resp = await eventAction.closeEvent(
        {
          params: {
            event_id: this.eventInfo.id
          }
        },
        JSCFindEvent
      );
      return runInAction(() => {
        this.isLoading = false;
        if (resp.type === EN_REQUEST_RESULT.SUCCESS && !!resp.data) {
          this.eventInfo = resp.data;
        }
        return null;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async addBeverage(title: string) {
    if (this.isLoading === true) {
      return null;
    }
    try {
      this.isLoading = true;

      const rb = new BeverageRequestBuilder({ isProxy: true });
      const beverageAction = new Beverage(rb);

      const resp = await beverageAction.add(
        {
          body: {
            title
          }
        },
        JSCAddBeverage
      );
      return runInAction(() => {
        this.isLoading = false;
        if (resp.type === EN_REQUEST_RESULT.SUCCESS && !!resp.data) {
          this.beverages.set(resp.data.id, resp.data);
        }
        return resp.data;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }
}
