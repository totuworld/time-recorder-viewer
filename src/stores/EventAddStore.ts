import { action, observable, runInAction } from 'mobx';

import { Event } from '../models/event/Event';
import { EventRequestBuilder } from '../models/event/EventRequestBuilder';
import { JSCAddEvent } from '../models/event/JSONSchema/JSCAddEvent';
import { IUserInfo, IUserItem } from '../models/user/interface/IUserInfo';
import { GetGroupUserInfosJSONSchema } from '../models/user/JSONSchema/GetGroupUserInfosJSONSchema';
import { User } from '../models/user/User';
import { UserRequestBuilder } from '../models/user/UserRequestBuilder';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class EventAddStore {
  @observable private targetUsers: Map<string, IUserInfo> = new Map();

  constructor({ users }: { users: IUserInfo[] }) {
    if (users.length > 0) {
      users.forEach(user => {
        this.targetUsers.set(user.id, user);
      });
    }
  }

  get Users() {
    return this.targetUsers;
  }

  @action
  public async findAndAddGroupUsers(groupId: string) {
    try {
      const rbParam: RequestBuilderParams = { isProxy: true };

      const rb = new UserRequestBuilder(rbParam);
      const userAction = new User(rb);
      const resp = await userAction.findGroups(
        { query: { groupId } },
        GetGroupUserInfosJSONSchema
      );
      if (resp.type === EN_REQUEST_RESULT.ERROR) {
        return [];
      }
      return runInAction(() => {
        const targetUsers = this.addUsers(resp.data);
        return targetUsers;
      });
    } catch (error) {
      throw error;
    }
  }

  @action
  public async addUsers(users: IUserInfo[]) {
    for (const user of users) {
      if (this.targetUsers.has(user.id)) {
        continue;
      }
      this.targetUsers.set(user.id, user);
    }
    return this.targetUsers;
  }

  @action
  public async removeUsers(user: IUserInfo) {
    if (this.targetUsers.has(user.id)) {
      this.targetUsers.delete(user.id);
    }
    return this.targetUsers;
  }

  @action
  public async createEvent({
    title,
    desc,
    private: published,
    owner
  }: {
    title: string;
    desc?: string;
    private: boolean;
    owner: IUserItem;
  }) {
    const rbParam: RequestBuilderParams = { isProxy: true };

    const rb = new EventRequestBuilder(rbParam);
    const eventAction = new Event(rb);
    const guests: IUserInfo[] = [];
    this.targetUsers.forEach(user => {
      guests.push(user);
    });
    try {
      const resp = await eventAction.addEvent(
        {
          body: {
            title,
            desc,
            owner,
            guests,
            private: published
          }
        },
        JSCAddEvent
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
    } catch (error) {
      throw error;
    }
  }
}
