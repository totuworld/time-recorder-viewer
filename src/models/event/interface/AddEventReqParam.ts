import { IUserItem } from '../../user/interface/IUserInfo';

export interface AddEventReqParam {
  body: {
    title: string;
    owner: IUserItem;
    desc?: string;
    private?: boolean;
    last_order?: Date;
    closed?: boolean;
    guests?: IUserItem[];
  };
}
