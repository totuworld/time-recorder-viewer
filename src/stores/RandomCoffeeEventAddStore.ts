import { action, runInAction } from 'mobx';

import { JSCAddRCEvent } from '../models/random_coffee/JSONSchema/JSCAddRCEvent';
import { RandomCoffee } from '../models/random_coffee/random_coffee';
import { RandomCoffeeRequestBuilder } from '../models/random_coffee/random_coffee.rb';
import { IUserItem } from '../models/user/interface/IUserInfo';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class RandomCoffeeEventAddStore {
  @action
  public async createEvent({
    title,
    desc,
    private: published,
    owner,
    last_register
  }: {
    title: string;
    desc?: string;
    private: boolean;
    owner: IUserItem;
    last_register: string;
  }) {
    const rbParam: RequestBuilderParams = { isProxy: true };

    const rb = new RandomCoffeeRequestBuilder(rbParam);
    const eventAction = new RandomCoffee(rb);

    const resp = await eventAction.add(
      {
        body: {
          title,
          desc,
          owner,
          last_register: new Date(last_register),
          private: published
        }
      },
      JSCAddRCEvent
    );
    if (resp.type === EN_REQUEST_RESULT.ERROR) {
      return null;
    }
    return runInAction(() => {
      if (!!resp.data) {
        return resp.data.id;
      }
      return null;
    });
  }
}
