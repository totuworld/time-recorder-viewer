import { IBeverage } from '../../beverage/interface/IBeverage';

export interface IEventOrder {
  guest_id: string;
  beverage_id: string;
  option?: string;
}

export type TEventOrder = IEventOrder & IBeverage;
