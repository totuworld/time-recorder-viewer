import { DateTime } from 'luxon';
import { action, observable, runInAction } from 'mobx';

import { IRandomCoffeeEvent } from '../models/random_coffee/interface/IRandomCoffeeEvent';
import { JSCDelRCEventGuest } from '../models/random_coffee/JSONSchema/JSCDelRCEventGuest';
import { RandomCoffee } from '../models/random_coffee/random_coffee';
import { RandomCoffeeRequestBuilder } from '../models/random_coffee/random_coffee.rb';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class RandomCoffeeEventDetailStore {
  @observable private isLoading: boolean = false;
  @observable private eventInfo: IRandomCoffeeEvent = {
    id: '?',
    title: '?',
    owner_id: '?',
    owner_name: '?',
    private: false,
    last_register: new Date(),
    desc: '?',
    closed: true
  };
  @observable private userRegister: boolean = false;

  constructor({ eventInfo }: { eventInfo: IRandomCoffeeEvent | null }) {
    if (!!eventInfo) {
      this.eventInfo = {
        ...eventInfo,
        last_register:
          typeof eventInfo.last_register === 'string'
            ? DateTime.fromISO(eventInfo.last_register).toJSDate()
            : DateTime.fromJSDate(eventInfo.last_register).toJSDate()
      };
    }
  }

  /** 이벤트 정보 */
  get Info() {
    return this.eventInfo;
  }

  /** 로딩 여부 */
  get LoadingState() {
    return this.isLoading;
  }

  /** 특정 사용자의 등록 여부 체크 */
  get UserRegister() {
    return this.userRegister;
  }

  @action
  public async checkUserRegister(userId: string) {
    if (this.isLoading === true) {
      return null;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const rb = new RandomCoffeeRequestBuilder(rbParam);
      const rcAction = new RandomCoffee(rb);
      const resp = await rcAction.checkGuestRegister(
        { params: { eventId: this.eventInfo.id, docId: userId } },
        JSCDelRCEventGuest
      );
      if (resp.type === EN_REQUEST_RESULT.ERROR) {
        return null;
      }
      return runInAction(() => {
        this.isLoading = false;
        if (resp.data !== null) {
          this.userRegister = resp.data.result;
        }
        return this.userRegister;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }
}
