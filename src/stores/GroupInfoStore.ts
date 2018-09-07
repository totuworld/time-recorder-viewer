import { observable } from 'mobx';

import { IGroupInfo } from '../models/group/interface/IGroupInfo';
import { ITimeRecordLogData } from '../models/time_record/interface/ITimeRecordLogData';
import {
    GetTimeRecordsJSONSchema
} from '../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';

export default class GroupInfoStore {
  @observable private isLoading: boolean = false;
  @observable private groupInfos: IGroupInfo[] = [];

  constructor(
    group: IGroupInfo[],
  ) {
    this.groupInfos = group;
  }

  get GroupInfos() {
    return this.groupInfos;
  }

  get isIdle(): boolean {
    return this.isLoading === false;
  }

}