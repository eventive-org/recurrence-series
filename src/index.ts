// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import * as moment from "moment";
import { RRule } from "rrule";
interface IEvent {
  start_time: Date,
  end_time: Date
}
export default class Series {
  private _events: IEvent[];
  private _created: IEvent[];
  private _updated: IEvent[];
  private _deleted: IEvent[];
  constructor(events: IEvent[] = []) {
    this._events = events;
    this._created = [];
    this._updated = [];
    this._deleted = [];
  }
  getEvents() {
    return this._events;
  }
  getCreatedEvents() {

  }
  getDeletedEvents() {

  }
  getUpdatedEvents() {
    return this._updated;
  }
  setRecurrence(rruleString: string) {

  }
  setLength(length: number) {
    this._updated = [];
    for (let event of this._events) {
      let diff = moment(event.end_time).diff(moment(event.start_time));
      if (diff !== length) {
        event.end_time = moment(event.start_time).add(length).toDate();
        this._updated.push(event);
      }
    }
  }
}
