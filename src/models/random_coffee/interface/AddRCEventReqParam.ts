import { IUserItem } from '../../user/interface/IUserInfo';

export interface AddRCEventReqParam {
  body: {
    title: string;
    owner: IUserItem;
    last_register: Date;
    desc?: string;
    private?: boolean;
  };
}
