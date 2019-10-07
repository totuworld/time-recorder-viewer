import { IUserInfo } from '../../user/interface/IUserInfo';

export interface AddRCEventGuestsReqParam {
  params: {
    eventId: string;
  };
  body: {
    guests: IUserInfo[];
  };
}
