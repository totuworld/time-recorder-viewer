import { observable } from 'mobx';

import { IRandomCoffeeEvent } from '../models/random_coffee/interface/IRandomCoffeeEvent';

export default class RandomCoffeeEventListStore {
  @observable private events: IRandomCoffeeEvent[] = [];

  constructor(events: IRandomCoffeeEvent[]) {
    this.events = events;
  }

  get Events() {
    return this.events;
  }

  set Events(values: IRandomCoffeeEvent[]) {
    this.events = values;
  }
}
