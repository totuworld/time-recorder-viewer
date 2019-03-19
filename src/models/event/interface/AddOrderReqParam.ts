import { IEventOrder } from './IEventOrder';

export interface AddOrderReqParam {
  params: {
    eventId: string;
  };
  body: {
    order: IEventOrder;
  };
}
