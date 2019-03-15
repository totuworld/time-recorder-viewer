import { observable } from 'mobx';

import { IEvent } from '../models/event/interface/IEvent';

export default class EventListStore {
  @observable private events: IEvent[] = [];

  constructor(events: IEvent[]) {
    this.events = events;
  }

  get Events() {
    return this.events;
  }

  set Events(values: IEvent[]) {
    this.events = values;
  }
}
