import { action, observable, runInAction } from 'mobx';

import { IQueue } from '../models/user/interface/IQueue';
import { User } from '../models/user/User';
import { UserRequestBuilder } from '../models/user/UserRequestBuilder';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { Util } from '../services/util';

export default class QueueStore {
  @observable private isOwned: boolean;
  @observable private queue: IQueue[];
  @observable private isLoading: boolean = false;

  constructor(queue: IQueue[]) {
    this.isOwned = false;
    this.queue = queue;
  }

  get IsOwned(): boolean {
    return this.isOwned;
  }
  set IsOwned(value: boolean) {
    this.isOwned = value;
  }

  get Queue(): IQueue[] {
    return this.queue;
  }

  @action
  public async deleteQueue(
    id: string,
    authId: string,
  ): Promise<IQueue[]> {
    if (this.isLoading === true) {
      return this.queue;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };
      const trRb = new UserRequestBuilder(rbParam);
      const trAction = new User(trRb);

      const deleteResp = await trAction.deleteQueue({
        key: id,
        authId
      });
      
      return runInAction(() => {
        this.isLoading = false;
        if (Util.isNotEmpty(deleteResp.data)) {
          this.queue = deleteResp.data;
        }
        return this.queue;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async addQueue(
    userId: string, reqUserId: string
  ): Promise<IQueue[]> {
    if (this.isLoading === true) {
      return this.queue;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };
      const trRb = new UserRequestBuilder(rbParam);
      const trAction = new User(trRb);

      const deleteResp = await trAction.addQueue({
        userId,
        body: {
          reqUserId
        }
      });
      
      return runInAction(() => {
        this.isLoading = false;
        if (Util.isNotEmpty(deleteResp.data)) {
          this.queue = deleteResp.data;
        }
        return this.queue;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }
}