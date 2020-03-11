import { action, observable, runInAction } from 'mobx';

import { Group } from '../models/group/Group';
import { GroupRequestBuilder } from '../models/group/GroupRequestBuilder';
import { IGroupInfo } from '../models/group/interface/IGroupInfo';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class GroupInfoStore {
  @observable private isLoading: boolean = false;
  @observable private groupInfos: IGroupInfo[] = [];

  constructor(group: IGroupInfo[]) {
    this.groupInfos = group;
  }

  get GroupInfos() {
    return this.groupInfos;
  }

  get isIdle(): boolean {
    return this.isLoading === false;
  }

  @action
  public async findAllGroupInfos() {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;
      const rbParam: RequestBuilderParams = { isProxy: true };
      const rb = new GroupRequestBuilder(rbParam);
      const trAction = new Group(rb);

      const actionResp = await trAction.findAllGroupInfos();
      return runInAction(() => {
        this.isLoading = false;
        if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
          this.groupInfos = actionResp.data;
        }
        return;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async deleteGroup({
    group_id
  }: {
    group_id: string;
  }): Promise<boolean> {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };
      const trRb = new GroupRequestBuilder(rbParam);
      const trAction = new Group(trRb);

      const result = await trAction.deleteGroup({
        group_id
      });

      return runInAction(() => {
        this.isLoading = false;
        return result.type === EN_REQUEST_RESULT.SUCCESS;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async addGroup({
    group_id,
    name,
    desc
  }: {
    group_id: string;
    name: string;
    desc: string;
  }): Promise<boolean> {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };
      const trRb = new GroupRequestBuilder(rbParam);
      const trAction = new Group(trRb);

      const result = await trAction.addGroup({
        group_id,
        desc,
        name
      });

      return runInAction(() => {
        this.isLoading = false;
        return result.type === EN_REQUEST_RESULT.SUCCESS;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }
}
